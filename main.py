#!/usr/bin/python3.5
print("Content-type:text/html\r\n\r\n")

#############################################
# Authors: (CodingGear)                     #
#   Yomaira Rivera Albarran                 #
#   Gustavo Hernandez Ortiz                 #
#   Ariel Torres Perez                      #
#                                           #
# Date: 3/17/2019                           #
# Updated: 5/19/2019                         #
# Distribution: Python 3.5                  #
#                                           #
# Whitestone is a sound and voting web       #
# application designed for the Academic     #
# Senate of the UPRM                        #
#############################################


from flask_cors import CORS, cross_origin
from flask import Flask, request, render_template, make_response, jsonify
from handler.ActivityLogHandler import ActivityLogHandler
from handler.AudioHandler import AudioHandler
from handler.CredentialHandler import CredentialHandler
from handler.MeetingHandler import MeetingHandler
from handler.UsersHandler import UsersHandler
from handler.VoteInHandler import VoteInHandler
from handler.VotingChoiceHandler import VotingChoiceHandler
from handler.VotingQuestionHandler import VotingQuestionHandler
from handler.RequestsHandler import RequestsHandler
from werkzeug import secure_filename
import os
import radius


#r = radius.Radius('whitestone', host='radius.uprm.edu', port=1812)

# The index.html file will be searched in the template folder called Whitestone_app
app = Flask(__name__ ,template_folder='Whitestone_app')
CORS(app)


@app.route("/")
def getHtml():
    """
    :return: Get the static Flask folder .js and .html files.  The folder MUST
    be called static.  This is a Flask app convention.
    """
    headers = {'Content-Type': 'text/html'}
    return make_response(render_template('index.html'),200,headers)


@app.route('/whitestone/credentials', methods=['GET', 'POST', 'PUT'])
def getAllCredentials():
    """
    :return: Search list for emergency local access
    """
    if request.method == 'POST':

        print("REQUEST", request.json)
        return CredentialHandler().insertCredentialJSON(request.json)

    if request.method == 'PUT':
        print("REQUEST", request.json)
        return CredentialHandler().updateCredential(request.json)

    else:
        return CredentialHandler().getAllCredentials()


@app.route('/whitestone/credentials/user', methods=['POST'])
def getUser():
    """
    :return: Search all the user information using its email as identifier
    """
    print("Request", request.json)
    return UsersHandler().getUser(request.json)



@app.route('/whitestone/delete/user/<int:uID>', methods=['POST'])
def deleteUser(uID):
    """
    :param uID: user id
    :return:  Search all the user information using its email as identifier
    """
    return UsersHandler().deleteUser(uID)


@app.route('/whitestone/users', methods=['GET', 'POST'])
def getAllUsers():
    """
    :return: Search all the info from users registered
    """
    if request.method == 'POST':

        print("REQUEST", request.json)
        return UsersHandler().insertUserJSON(request.json)
    else:

        return UsersHandler().getAllUsersInfo()


@app.route('/whitestone/edituser/<int:uid>', methods=["PUT"])
def updateUser(uid):
    """
    :param uid: user id
    :return: Edit user information
    """
    print("REQUEST", request.json)
    return UsersHandler().updateUser(uid, request.json)



@app.route('/whitestone/senators', methods=['GET'])
def getAllSenators():
    """
    :return: Search all senators including the chancellor
    """
    return UsersHandler().getAllSenator()


@app.route('/whitestone/electsenators', methods=['GET'])
def getAllElectSenators():
    """
    :return: Search all elect senators
    """
    return UsersHandler().getAllElectSenator()


@app.route('/whitestone/electstudentsenators', methods=['GET'])
def getAllElectStudentSenators():
    """
    :return: Search all elect student senators
    """
    return UsersHandler().getAllElectStudentsSenator()



@app.route('/whitestone/exofficiosenators', methods=['GET'])
def getAllExOfficioSenators():
    """
    :return: Search all ex-officio senators
    """
    return UsersHandler().getAllExOfficioSenator()



@app.route('/whitestone/exofficiostudentsenators', methods=['GET'])
def getAllExOfficioStudentSenators():
    """
    :return: Search all Ex-Officio student senators
    """
    return UsersHandler().getAllExOfficioStudentsSenator()



@app.route('/whitestone/meeting/oldmeetings', methods=['GET'])
def getOldMeetings():
    """
    :return: Search old meetings (inactive)
    """
    return MeetingHandler().getOldMeetings()



@app.route('/whitestone/activemeeting', methods=['GET', 'POST'])
def getMeeting():
    """
    :return: Show the active meeting and its info
    """
    if request.method == 'POST':

        print("REQUEST", request.json)
        return MeetingHandler().insertMeetingJSON(request.json)

    else:
        return MeetingHandler().getActiveMeeting()




@app.route('/whitestone/meetingstatus', methods=["PUT"])
def updateMeetingStatus():
    """
    :return: Update meeting status
    """
    print("REQUEST", request.json)
    return MeetingHandler().updateMeetingStatus(request.json)



@app.route('/whitestone/voting',  methods=['POST'])
def postVotingBymID():
    """
    :return: Post voting question by mID
    """
    print("REQUEST", request.json)
    return VotingQuestionHandler().insertVotingJSON(request.json)



@app.route('/whitestone/inactivevotings/<int:mID>')
def getInactiveVotingBymID(mID):
    """
    :param mID: meeting id
    :return: Get inactive or closed voting question by mID
    """
    return VotingQuestionHandler().getInactiveVotingQuestionBymID(mID)



@app.route('/whitestone/activevotings/<int:mID>', methods=['GET'])
def getActiveVotingBymID(mID):
    """
    :param mID: meeting id
    :return: Get active or open voting question by mID
    """
    return VotingQuestionHandler().getActiveVotingQuestionBymID(mID)



@app.route('/whitestone/voting/<int:vid>')
def getVotingByvID(vid):
    """
    :param vid: voting id
    :return: Search voting by vID
    """
    return VotingQuestionHandler().getVotingQuestionByID(vid)



@app.route('/whitestone/votingresults', methods=['PUT'])
def updateVotingResults():
    """
    :return: Put the voting results by vID
    """
    print("REQUEST", request.json)
    return VotingChoiceHandler().updateVotingChoice(request.json)



@app.route('/whitestone/voting/choice', methods=['POST'])
def postAlternatives():
    """
    :return: Post voting alternatives
    """
    print("REQUEST", request.json)
    return VotingChoiceHandler().insertChoiceJSON(request.json)



@app.route('/whitestone/voting/<int:vid>/choices')
def getAlternatives(vid):
    """
    :param vid: voting id
    :return: Search voting choices and its altIDs by voting id
    """
    return VotingChoiceHandler().getVotingChoiceByVID(vid)


@app.route('/whitestone/activevoting/<int:vid>/choices')
def getActiveVotingAlternatives(vid):
    """
    :param vid: voting id
    :return: Search active voting choices and its altIDs by voting id
    """
    return VotingChoiceHandler().getActiveVotingChoiceByvID(vid)


@app.route('/whitestone/requestTurn', methods=['POST'])
def postRequest():
    """
    :return: submit a request and add it to the waiting list
    """
    print("REQUEST SUBMIT", request.json)
    return RequestsHandler().submitRequest(request.json)

@app.route('/whitestone/cancelTurn', methods=['POST'])
def cancelRequest():
    """
    :return: Update the waiting list by eliminating the request
    """
    print("REQUEST CANCEL", request.json)
    return RequestsHandler().cancelRequest(request.json)



@app.route('/whitestone/checkrequest/<int:uid>', methods=['GET'])
def checkRequest(uid):
    """
    :param uid: user id
    :return: CHeck the request flag status 
    """
    print("REQUEST CHECK REQUEST")
    return RequestsHandler().checkRequest(uid)


@app.route('/whitestone/checkapproval', methods=['POST'])
def checkApproval():
    """
    :return: Check the approval flag status (if the request to speak has been granted or not)
    """
    print("REQUEST Check Approval ", request.json)
    return RequestsHandler().checkApproval(request.json)


@app.route('/whitestone/emptylist', methods=['POST'])
def clearList():
    """
    :return: Empty the waiting list or speak request list
    """
    return RequestsHandler().clearList()

@app.route('/whitestone/grantrequest', methods=['PUT'])
def grantRequestToSenator():
    """
    :return: grants the request to speak
    """
    print("REQUEST GRANT ", request.json)
    return RequestsHandler().grantRequest(request.json)


@app.route('/whitestone/denyrequest', methods=['PUT'])
def denyRequestToSenator():
    """
    :return: Deny the request to speak
    """
    print("REQUEST DENY ", request.json)
    return RequestsHandler().denyRequest(request.json)

@app.route('/whitestone/getrequestlist', methods=['GET'])
def getRequestList():
    """
    :return: get the waiting list
    """
    print("REQUEST GET LIST ", request.json)
    return RequestsHandler().getRequestList()



@app.route('/whitestone/closevoting', methods=['PUT'])
def closeVoting():
    """
    :return: Update voting status to Inactive
    """
    print("REQUEST", request.json)
    return VotingQuestionHandler().updateVotingStatus(request.json)


@app.route('/whitestone/meeting/<int:mid>/audio', methods=['POST', 'GET'])
def meetingAudio(mid):
    """
    :param mid: meetinhg id
    :return: Post or get audio by mID
    """
    if request.method == 'POST':
        print("REQUEST", request.json)
        return AudioHandler().insertAudioJSON(request.json)
    else:
     return AudioHandler().getAudioBymID(mid)



@app.route('/whitestone/audio/<int:aid>', methods=['GET'])
def getAudio(aid):
    """
    :param aid: audio id
    :return: Get audio by aid
    """
    return AudioHandler().getAudioByaID(aid)




@app.route('/whitestone/<int:uid>/votesIn/<int:vid>', methods=['POST', 'GET', 'PUT'])
def VotesIn(vid, uid):
    """
    :param vid: voting id
    :param uid: user id
    :return:  Post or get voting participant
    """
    if request.method == 'POST':
        print("REQUEST", request.json)
        return VoteInHandler().insertVoteInJSON(request.json)

    if request.method == 'PUT':
        print("REQUEST", request.json)
        return VoteInHandler().updateVoteInFlag(request.json)

    else:
        return VoteInHandler().getParticipant(vid, uid)



@app.route('/whitestone/activitylog', methods=['POST'])
def ActivityLog():
    """
    :return: Post new activity log
    """
    print("REQUEST", request.json)
    return ActivityLogHandler().insertActivityLogJSON(request.json)



@app.route('/whitestone/getactivitylog', methods=['POST'])
def getActivityLog():
    """
    :return: Get activity log by date
    """
    print("REQUEST", request.json)
    return ActivityLogHandler().getActivityLogByDate(request.json.get('date'))


@app.route('/whitestone/meeting/<int:mid>/upload', methods=['POST'])
def uploadAudio(mid):
    """
    :param mid: meeting id
    :return: Upload audio files to the server
    """
    print("UPLOAD FILE")
    if request.method == 'POST':
        #Added by Ariel
        #Creates the folder inside the server
        parentPath = '/var/www/html/Whitestone/static/audio/'
        audioFileFolder = os.path.join(parentPath,str(mid))
        try:
            os.mkdir(audioFileFolder,0o755)
            print("Directory created.")
        except FileExistsError:
            print("Directory exists")
        #Uploads the file to the server
        file = request.files['file']
        file.save(os.path.join(audioFileFolder, secure_filename(file.filename)))
        return("Uploaded: " + audioFileFolder + file.filename)


@app.route('/radius', methods=['POST'])
def authenticateUser():
    """
    Authenticates the user using a RADIUS protocol
    :return: Success/Failure
    """
    # UPRM Radius server connection
    r = radius.Radius('whitestone', host='radius.uprm.edu', port=1812)
    if request.method == 'POST':
		try:
			if r.authenticate(request.json.get('email'), request.json.get('password')):
				return "Success"
			else:
				return "Failure"
		except NameError:
			return "Failure"
		except TypeError:
			return "Failure"
		except:
			return "Failure"


if __name__ == '__main__':
    """Run the Flask app with the ssl (https) secure certificates"""
    app.run(ssl_context=('/etc/pki/tls/certs/whitestone.crt', '/etc/pki/tls/certs/whitestone.key'), host='0.0.0.0', port='8000')
        


