from flask import jsonify 
from dao.AudioDAO import AudioDAO
from dao.MeetingDAO import MeetingDAO


global requestList 
requestList = []


class AudioHandler:
    def mapToAudioDict(self, row):
        """
        Map the audio information to dictionary
        :param row: array containing audio information
        :return: audio dictionary
        """
        result = {}
        result['aID'] = row[0]
        result['mID'] = row[1]
        result['aname'] = row[2]
        result['aadress'] = row[3]
        result['atype'] = row[4]
        return result

    def buildAudioToDict(self, aID, mID, aname, aaddress, atype):
        """
        Built the audio dictionary
        :param aID: audio id
        :param mID: meeting id
        :param aname: audio name
        :param aaddress: audio address
        :param atype: audio type
        :return: audio dictionary
        """
        result ={}
        result['aID'] = aID
        result['mID'] = mID
        result['aname'] = aname
        result['aadress'] = aaddress
        result['atype'] = atype
        return result

    def getAudioByaID(self, aID):
        """
        Handle information of an audio specified by aID
        :param aID: audio id
        :return: return the audio as json representation
        """
        result = AudioDAO().getAudioByaID(aID)
        if not result:
            return jsonify(Error="NOT FOUND"), 404
        else:
            mapped_result = self.mapToAudioDict(result)
            return jsonify(Audio=mapped_result)

    def getAudioBymID(self, mID):
        """
        Handle information of all the audios that belong to a meeting specified by mID
        :param mID: meeting id
        :return: return the audio information as json representation
        """
        result = AudioDAO().getAudioBymID(mID)
        mapped_result = []
        if not result:
            return jsonify(Error="NOT FOUND"), 404
        else:
            for r in result:
                mapped_result.append(self.mapToAudioDict(r))
            return jsonify(Audio=mapped_result)

    def getAudioByAddress(self, address):
        """
        Handle information of the audio specified by an address
        :param address: audio physical path
        :return: audio information as json representation
        """
        result = AudioDAO().getAudioByAddress(address)
        mapped_result = []
        if not result:
            return jsonify(Error="NOT FOUND"), 404
        else:
            for r in result:
                mapped_result.append(self.mapToAudioDict(r))
            return jsonify(Audio=mapped_result)


    def insertAudioJSON(self, json):
        """
        Handle information insertion of a new audio file
        :param json:
        :return:audio information inserted as json
        """
        mID = json.get('mID')
        aname = json.get('aname');
        aaddress = json.get('aaddress');
        atype = json.get('atype');
        if not MeetingDAO().getMeetingBymID(mID):
            return jsonify(Error="MEETING NOT EXIST"), 400
        else:
            if mID and aname and aaddress and atype:
                aID = AudioDAO().insert(mID, aname, aaddress, atype)
                mapped_result = self.buildAudioToDict(aID, mID, aname, aaddress, atype)
                return jsonify(Audio=mapped_result), 201
            else:
                return jsonify(Error="Unexpected attributes in post request"), 400
