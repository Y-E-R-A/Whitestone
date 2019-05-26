import datetime
from flask import jsonify, request
from dao.ActivityLogDAO import ActivityLogDAO
from psycopg2._psycopg import Date

class ActivityLogHandler:

    def mapToActivityLogDict(self, row):
        """
        Map the activity log information to dictionary
        :param row:
        :return:
        """
        result = {}
        result['date'] = row[0]
        result['time'] = str(row[1])
        result['urole'] = str(row[2])
        result['email'] = row[3]
        result['logmessage'] = row[4]
        return result


    def builtActivityLogDict(self, logID, urole, email, time, date, logmessage):
        """
         Built the activity log information to dictionary, includes logID
        :param logID: activity log id
        :param urole: user role
        :param email: UPR email
        :param time: time in which the activity log was performed
        :param date: date in which the activity log was performed
        :param logmessage: action performed
        :return:
        """
        result = {}
        result['logID'] = logID
        result['urole'] = urole
        result['email'] = email
        result['date'] = str(date)
        result['time'] = str(time)
        result['logmessage'] = logmessage
        return result


    def getActivityLogByDate(self, date):
        """
        Handle the search of the activity log by date
        :param date:(str) DD/MM/YYYY
        :return:
        """
        day, month, year = date.split('-')

        isValidDate = True
        try:
            datetime.datetime(int(year), int(month), int(day))
        except ValueError:
            isValidDate = False

        if (isValidDate):
            date= str(year).zfill(4) +"-"+ str(month).zfill(2) +"-"+ str(day).zfill(2)
            print(date)
            result = ActivityLogDAO().getActivityLogByDate(date)
            mapped_result = []

            if not result:
                return jsonify(Error="NOT FOUND"), 404

            else:
                for r in result:
                    mapped_result.append(self.mapToActivityLogDict(r))
                return jsonify(Log=mapped_result), 200

        else:
            return jsonify(Error="Unexpected attributes in post request"), 400


    
    def insertActivityLogJSON(self, json):
        """
        Handle the insertion of a new activity log
        :param json:
        :return:
        """
        urole = json.get('urole')
        uemail = json.get('uemail')
        date = json.get('date')
        time = json.get('time')
        logmessage = json.get('logmessage')

        day, month, year = date.split('/')
        isValidDate = True
        try:
            datetime.datetime(int(year), int(month), int(day))
        except ValueError:
            isValidDate = False

        if (isValidDate):

            date = Date(int(year), int(month), int(day))
    
            if urole and uemail and date and time and logmessage:
                logID = ActivityLogDAO().insertActivityLog(urole, uemail, date, time, logmessage)                
                mapped_result = self.builtActivityLogDict(logID, urole, uemail, time, date, logmessage)
                return jsonify(Log=mapped_result), 201
            else:		
                 return jsonify(Error="Unexpected attributes in post request"), 400
