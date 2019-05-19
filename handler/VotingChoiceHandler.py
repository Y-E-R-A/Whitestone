from flask import jsonify, request
from dao.VoteInDAO import VoteInDAO
from dao.VotingChoiceDAO import VotingChoiceDAO
from dao.VotingQuestionDAO import VotingQuestionDAO

class VotingChoiceHandler:

    def builtVotingChoiceDict(self, altID, vID, choice, votes):
        """
        Voting Choice Info dictionary
        :param altID: alternative or choice id
        :param vID: voting id
        :param choice: choice argument
        :param votes: votes count
        :return:
        """

        result = {}
        result['altID'] = altID
        result['vID'] = vID
        result['choice'] = choice
        result['votes'] = votes
        return result


    def mapVotingChoiceByVID(self, row):
        """
        Maps to Voting Choice info dictionary
        :param row: alternative id, choice, votes
        :return: voting choice dictionary
        """
        result = {}
        result['altID'] = row[0]
        result['choice'] = row[1]
        result['votes'] = row[2]
        return result

    def mapToUpdateVotingChoiceDict(self, vID, altID, votes):
        """
        Voting Choice Info dictionary
        :param vID: voting id
        :param altID: alternative id
        :param votes: votes count
        :return: update voting dictionary
        """
        result = {}
        result['altID'] = altID
        result['vID'] = vID
        result['votes'] = votes
        return result

    def mapToUpdateVotingChoiceResult(self, altID):
        """
        Display the id of the recently updated alternative's votes count
        :param altID: alternative id
        :return:
        """
        result = {}
        result['altID'] = altID
        return result

    def getVotingChoiceByVID(self, vID):
        """
        Handler for getting the voting choices of a voting
        :param vID: voting id
        :return:
        """
        result = VotingChoiceDAO().getVotingChoiceByVID(vID)
        mapped_result = []

        if not result:
            return jsonify(Error="NOT FOUND"), 404

        else:
            for r in result:
                mapped_result.append(self.mapVotingChoiceByVID(r))

            return jsonify(Choice=mapped_result)



    def getActiveVotingChoiceByvID(self, vID):
        """
        Handler for getting the active voting alternatives of a voting
        :param vID: voting id
        :return:
        """
        global activeVotingQuestion
        global choiceResultArray
        result = VotingChoiceDAO().getActiveVotingChoiceByVID(vID)
        mapped_result = []

        if not result:
            return jsonify(Error="ACTIVE VOTING NOT FOUND"), 404

        else:
            for r in result:
                mapped_result.append(self.mapVotingChoiceByVID(r))

            return jsonify(Choice=mapped_result), 200


    def insertChoiceJSON(self, json):
        """
        Insert voting alternative
        :param json: vID, choice, votes
        :return: json file containing the information of the recently inserted choice
        """


        vID = json.get('vID')
        choice = json.get('choice');
        votes = 0;

        if not VotingQuestionDAO().getVotingQuestionByID(vID):
            return jsonify(Error="VOTING NOT FOUND"), 404


        else:
            if vID and choice:

                altID = VotingChoiceDAO().insertVotingChoice(vID, choice, votes)
                mapped_result = self.builtVotingChoiceDict(altID, vID, choice, votes)
                return jsonify(Choice=mapped_result), 201

            else:

                return jsonify(Error="Unexpected attributes in post request"), 404


    def updateVotingChoice(self, form):
        """
        Update the voting choice count by adding one to its votes count
        :param form: altID, mID
        :return: json containing the recently updated voting choice
        """
        altID = form['altID']
        mID = form['mID']
        status = VotingQuestionDAO().getActiveVotingQuestionBymID(mID)

        if not VotingChoiceDAO().getVotingChoiceByID(altID):
            return jsonify(Error="Voting Choice not found."), 404
        else:

            if len(form) != 2:
                return jsonify(Error="Malformed update request"), 400
            else:
                if altID and status:
                    VotingChoiceDAO().updateVotingChoice(altID)
                    result = self.mapToUpdateVotingChoiceResult(altID)
                    return jsonify(Choice=result), 201
                else:
                    return jsonify(Error="Unexpected attributes in update request"), 400
