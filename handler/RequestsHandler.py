from flask import jsonify
from dao.RequestsDAO import RequestsDAO


class RequestsHandler:

    def buildRequestToDict(self, uID, request, approval):
        """
        Built the request to speak to dictionary
        :param uID:
        :param request:
        :param approval:
        :return: request dictionary
        """
        result = {}
        result['uID'] = uID
        result['request'] = request
        result['approval'] = approval
        return result

    def buildApprovalToDict(self, uID, approval, firstname, lastname):
        """
        Built the request to speak approval to dictionary
        :param uID: user id
        :param approval: approval flag
        :param firstname: user first name
        :param lastname: user last name
        :return: return uid, approval flag and full name represented as json
        """
        result = {}
        result['uID'] = uID
        result['approval'] = approval
        result['firstname'] = firstname
        result['lastname'] = lastname
        return result

    def buildGrantDenyToDict(self, uID, approval):
        """
        Built the request to speak denial to dictionary
        :param uID: user identifier
        :param approval: approval flag
        :return: approval flag by user id
        """
        result = {}
        result['uID'] = uID
        result['approval'] = approval
        return result

    def buildCheckRequestToDict(self, uID, request, firstname, lastname):
       """
       Map request to dictionary
       :param uID: user id
       :param request:  request flag (True/ False)
       :param firstname: user first name
       :param lastname: user last name
       :return: distionary conatining uid, request flag, user full name
       """
       result = {}
       result['uID'] = uID
       result['request'] = request
       result['firstname'] = firstname
       result['lastname'] = lastname
       return result

    def mapToUserRequestDict(self, row):
        """
        Map user speak request information to dictionary
        :param row:
        :return: user request dictionary
        """
        result = {}
        result['rID'] = row[0]
        result['uID'] = row[1]
        result['request'] = row[2]
        result['approval'] = row[3]
        result['uname'] = row[4]
        result['ulastname'] = row[5]
        return result

    def submitRequest(self, json):
        """
        Handles the submission for a speak request
        :param json: parameters to insert a speak request: user id
        :return: request to speak information as json representation
        """
        uID = json.get('uID')
        request = True
        approval = "Wait"
        if uID:

            RequestsDAO().insertRequest(uID, request, approval)
            mapped_result = self.buildRequestToDict(uID, request, approval)
            return jsonify(TURN=mapped_result), 201

        else:
            return jsonify(Error="Unexpected attributes in post request"), 400


    def cancelRequest(self, json):
        """
        Handles the cancellation of a speak request.  The senator uses this function to
        cancel its request to speak.
        :param json: parameters to insert a speak request: user id
        :return: request to speak cancellation information as json representation
        """
        uID = json.get('uID')
        print(RequestsDAO().getRequestByuID(uID))
        if not RequestsDAO().getRequestByuID(uID):
            return jsonify(Error="No request found"), 404
        else:

            if uID:
                RequestsDAO().deleteRequest(uID)
                return jsonify(User="User deleted"), 200
            else:
                return jsonify(Error="Unexpected attributes in update request"), 400


    def checkApproval(self, json):
        """
        Handles the information about the speak turn approval
        :param json: user iD
        :return: approval status as json representation
        """
        uID = json.get('uID')
        if not RequestsDAO().getRequestByuID(uID):
            return jsonify(Error="No request found"), 404
        else:
            if uID:
                approval = RequestsDAO().getApprovalStatusByuID(uID)
                mapped_result = self.buildApprovalToDict(uID, approval[0], approval[1], approval[2])
                return jsonify(TURN=mapped_result), 200

            else:
                return jsonify(Error="Unexpected attributes in post request"), 400



    def checkRequest(self, uID):
        """
        Handles the information about the speak turn approval
        :param uID: user id
        :return: request status as json (True or False)
        """

        if not RequestsDAO().getRequestByuID(uID):
            return jsonify(Error="No request found"), 404
        else:
            if uID:
                approval = RequestsDAO().getRequestStatusByuID(uID)
                mapped_result = self.buildCheckRequestToDict(uID, approval[0], approval[1], approval[2])
                return jsonify(TURN=mapped_result), 200

            else:
                return jsonify(Error="Unexpected attributes in post request"), 400



    def clearList(self):
        """
        Handles the truncate operation of the waiting list or speak request list
        :return: 200
        """

        if not RequestsDAO().getRequests():
            return jsonify(Error="No requests found"), 404
        else:

            RequestsDAO().truncateTurnTable()
            return jsonify(TURN="Table content was deleted"), 200

    def grantRequest(self, json):
        uID = json.get('uID')
        if not RequestsDAO().getRequestByuID(uID):
            return jsonify(Error="User speak request not found"), 404
        else:
            approval = RequestsDAO().grantTurn(uID)
            mapped_result = self.buildGrantDenyToDict(uID, approval[0])
            return jsonify(TURN=mapped_result), 200



    def denyRequest(self, json):
        """
        Handles the denial of a speak request from a user.  The Chancellor uses this operation
        to avoid a user from speaking or using its USB mic to record their audio.
        :param json:
        :return: approval status flag
        """
        uID = json.get('uID')
        if not RequestsDAO().getRequestByuID(uID):
            return jsonify(Error="User speak request not found"), 404
        else:
            approval = RequestsDAO().denyTurn(uID)
            mapped_result = self.buildGrantDenyToDict(uID, approval[0])
            return jsonify(TURN=mapped_result), 200



    def getRequestList(self):
        """
        The Chancellor role uses this function to ask for the waiting list or the speak request list
        :return: waiting list as json
        """

        result = RequestsDAO().getRequests()
        mapped_result = []

        if not result:
            return jsonify(Error="NOT FOUND"), 404

        else:
            for r in result:
                mapped_result.append(self.mapToUserRequestDict(r))

            return jsonify(TURN=mapped_result), 200
