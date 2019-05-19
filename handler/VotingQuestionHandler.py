from flask import jsonify, request
from dao.VotingQuestionDAO import VotingQuestionDAO


class VotingQuestionHandler:

    def builtVotingQuestionDict(self, vID, mID, vinstructions, vdate, vtime, vquestion, selectionlimit, vstatus):
        """
        Built voting  question to dictionary
        :param vID: (int) voting id
        :param mID: (int) meeting id
        :param vinstructions:(str) voting instructions
        :param vdate: (str) voting date  in which the voting was created
        :param vtime: (time) time in which the vote was created
        :param vquestion: (str) voting question
        :param selectionlimit:(int) alternative selection number
        :param vstatus: (str) Active/Inactive
        :return: voting question dictionary
        """
        # Voting Info dictionary
        result = {}
        result['vID'] = vID
        result['mID'] = mID
        result['vinstructions'] = vinstructions
        result['vdate'] = str(vdate)
        result['vtime'] = str(vtime)
        result['vquestion'] = vquestion
        result['selectionlimit'] = selectionlimit
        result['vstatus'] = vstatus
        return result

    def builtVotingStatusDict(self, vID, vstatus):
        """
        Built the voting status information dictionary
        :param vID: voting id
        :param vstatus:  voting status
        :return:
        """

        result = {}
        result['vID'] = vID
        result['vstatus'] = vstatus
        return result

    def mapToVotingQuestionDict(self, row):
        """
        Map an inactive voting question to dictionary
        :param row: vid, mid, vinstructions, vdate, vtime,
        vquestion, selectionlimit, vstatus
        :return: voting question dictionary
        """
        result = {}
        result['vID'] = row[0]
        result['mID'] = row[1]
        result['vinstructions'] = row[2]
        result['vdate'] = str(row[3])
        result['vtime'] = str(row[4])
        result['vquestion'] = row[5]
        result['selectionlimit'] = row[6]
        result['vstatus'] = row[7]
        return result

    def mapToActiveVotingQuestionDict(self, row):
        """
        Map an active voting question to dictionary (Question with choices)
        :param row: vid, mid, vinstructions, vdate, vtime, vquestion,
        seletion limit, vstatus
        :return:
        """

        result = {}
        result['vID'] = row[0]
        result['mID'] = row[1]
        result['vinstructions'] = row[2]
        result['vdate'] = str(row[3])
        result['vtime'] = str(row[4])
        result['vquestion'] = row[5]
        result['selectionlimit'] = row[6]
        result['vstatus'] = row[7]
        return result


    def mapToVotingResultsDict(self, row):
        """
        Map voting result to dictionary
        :param row: vchoice, votes
        :return:
        """

        result = {}
        result['vchoice'] = row[0]
        result['votes'] = row[1]
        return result


    def getVotingQuestionByID(self, vID):
        """
        Handle the search of the voting question by its vid
        :param vID: voting id
        :return:
        """
        result = VotingQuestionDAO().getVotingQuestionByID(vID)

        if not result:
            return jsonify(Error="NOT FOUND"), 404

        else:
            mapped_result = self.mapToVotingQuestionDict(result)
            return jsonify(Voting=mapped_result), 200



    def getInactiveVotingQuestionBymID(self, mID):
        """
        Handle the search of the voting question by its mid
        :param mID: meeting id
        :return: json with the inactive voting
        """

        result = VotingQuestionDAO().getInactiveVotingQuestionBymID(mID)
        mapped_result = []

        if not result:
            return jsonify(Error="NOT FOUND"), 404

        else:
            for r in result:
                mapped_result.append(self.mapToVotingQuestionDict(r))
            print("Result:", mapped_result)

            return jsonify(Voting=mapped_result), 200


    def getActiveVotingQuestionBymID(self, mID):
        """
        Handle the search of the active voting question by the mid
        :param mID: meeting id
        :return: json with the active voting question
        """
        result = VotingQuestionDAO().getActiveVotingQuestionBymID(mID)
        mapped_result = []

        if not result:
            return jsonify(Error="NOT FOUND"), 404

        else:
            for r in result:
                mapped_result.append(self.mapToActiveVotingQuestionDict(r))

            return jsonify(Voting=mapped_result), 200



    def updateVotingStatus(self, form):
        """
        Handle the update the closing of a voting by its vid
        :param form: voting id
        :return: json with the updated voting information
        """

        vID = form['vID']
        vstatus = "Inactive"

        if not VotingQuestionDAO().getVotingQuestionByID(vID):
            return jsonify(Error="Voting not found."), 404
        else:
            if len(form) != 1:
                return jsonify(Error="Malformed update request"), 400
            else:

                if vID and vstatus:
                    VotingQuestionDAO().updateVotingStatus(vID, vstatus)
                    result = self.builtVotingStatusDict(vID, vstatus)
                    return jsonify(Voting=result), 200
                else:
                    return jsonify(Error="Unexpected attributes in update request"), 400


    def insertVotingJSON(self, json):
        """
        Handle the insertion of a new voting question
        :param json: mID, vinstructions, vdate, vtime, vquestion, selectionlimit, vstatus
        :return: json with the new voting question
        """

        mID = json.get('mID')
        vinstructions = json.get('vinstructions')
        vdate = json.get('vdate')
        vtime = json.get('vtime')
        vquestion = json.get('vquestion')
        selectionlimit = json.get('selectionlimit')
        vstatus = json.get('vstatus')


        if mID and vdate and vtime and vquestion and selectionlimit and vstatus:

            vID = VotingQuestionDAO().insertVotingQuestion(mID, vinstructions, vdate, vtime, vquestion, selectionlimit, vstatus)
            mapped_result = self.builtVotingQuestionDict(vID, mID, vinstructions, vdate, vtime, vquestion, selectionlimit, vstatus)
            return jsonify(Voting=mapped_result), 201

        else:

            return jsonify(Error="Unexpected attributes in post request"), 400