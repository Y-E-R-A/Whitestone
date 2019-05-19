from flask import jsonify, request
from dao.UsersDAO import UsersDAO
from dao.VoteInDAO import VoteInDAO
from dao.VotingQuestionDAO import VotingQuestionDAO


class VoteInHandler:


    def buildVoteInDict(self, vID, uID, exercise_vote):
        """
        Built the voting participants (vote in) dictionary
        :param vID: voting id
        :param uID: user id
        :param exercise_vote: flag that indicates if the user voted or not (True/False)
        The default flag value is False
        :return: Vote In dictionary
        """
        result = {}
        result['vID'] = vID
        result['uID'] = uID
        result['exercise_vote'] = exercise_vote
        return result


    def mapVotingParticipantsToDict(self, row):
        """
        Map to Voting participants dictionary
        :param row: voting id, user id, exercised vote flag
        :return: Voting Partincipants dictionary
        """
        result = {}
        result['vID'] = row[0]
        result['uID'] = row[1]
        result['exercise_vote'] = row[2]
        return result


    def getParticipant(self, vID, uID):
        """
        Handle the verification request to check whether
        a user have permissions to participate in a voting.
        :param vID: voting id
        :param uID: user id
        :return:200 or 404
        """

        result = VoteInDAO().getParticipant(vID,uID)
        if not result:
            return jsonify(Error="USER IS NOT PARTICIPANT OR VOTING NOT FOUND"), 404
        else:
            mapped_result = self.mapVotingParticipantsToDict(result)
            return jsonify(Participant=mapped_result), 200



    def insertVoteInJSON(self, json):
        """
        Handle the insertion of a voting participant
        :param json: voting id, user id
        :return: vote in information json representation
        """

        uID = json.get('uID')
        vID = json.get('vID')

        if VoteInDAO().getParticipant(vID, uID):
            return jsonify(Error="User was previously registered for this voting.  Nothing to do"), 400

        elif not VotingQuestionDAO().getVotingQuestionByID(vID) or not(UsersDAO().getUserByuID(uID)):
            return jsonify(Error="NOT FOUND"), 404

        else:
            if uID and vID:

                VoteInDAO().insertVoteIn(uID, vID)
                mapped_result = self.buildVoteInDict(vID, uID, False)
                return jsonify(VoteIn=mapped_result), 201

            else:
                return jsonify(Error="Unexpected attributes in post request"), 404


    def updateVoteInFlag(self, form):
        """
        Handle the insertion of a voting participant
        :param form: voting id, user id
        :return: json with the vote in flag updated information
        """
        vID = form['vID']
        uID = form['uID']
        exercise_vote = True


        if not VoteInDAO().getParticipant(vID, uID):
            return jsonify(Error="User is not participant."), 404

        else:

            if len(form) != 2:
                return jsonify(Error="Malformed update request"), 400
            else:
                vstatus = VoteInDAO().getVotingStatusFlag(uID, vID);
                print(vstatus)

                if vstatus == False:
                    if vID and uID:
                        VoteInDAO().updateVoteInFlag(uID, vID)
                        result = self.buildVoteInDict(vID, uID, exercise_vote)
                        return jsonify(VoteIN=result), 201
                    else:
                        return jsonify(Error="Unexpected attributes in put request"), 400
                else:
                    return jsonify(Error="Vote already exercised"), 404


