from configs.dbconfig import pg_config
import psycopg2

class MeetingDAO:

    def __init__(self):
        """Database connection"""
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],

                                                            pg_config['user'],

                                                            pg_config['passwd'])

        self.conn = psycopg2._connect(connection_url)


    def getOldMeetings(self):
        """
        :return: Return all the old or inactive meeting information
        """

        cursor = self.conn.cursor()
        query = " SELECT * " \
                "FROM Meeting " \
                "WHERE mstatus = 'Inactive';"
        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)
        return result

    def getActiveMeeting(self):
        """
        :return: Return all the old or inactive meeting information
        """
        cursor = self.conn.cursor()
        query = "SELECT * " \
                "FROM Meeting " \
                "WHERE mstatus = 'Active';"
        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)
        return result

    def getMeetingBymID(self, mID):
        """
        :param mID: meeting ID
        :return: Return the meeting information by mID
        """
        cursor = self.conn.cursor()
        query = "SELECT * " \
                "FROM Meeting " \
                "WHERE mID = %s;"
        cursor.execute(query, (mID,))
        result = cursor.fetchone()
        return result


    def updateMeetingStatus(self, mID, mstatus):
        """
        Modify the meeting status (Active or Inactive)
        :param mID: meeting ID
        :param mstatus: meeting status (Active/Inactive)
        :return:
        """

        cursor = self.conn.cursor()
        query = "UPDATE Meeting " \
                "SET mstatus = %s " \
                "WHERE mID = %s"
        cursor.execute(query, (mstatus, mID, ))
        self.conn.commit()


    def insertMeeting(self, mdate, mtime, mname, mdescription, mstatus):
        """
        Insert a new meeting session in the table Meeting
        :param mdate: (str) meeting date
        :param mtime: (time) meeting time
        :param mname: (str) meeting name
        :param mdescription: (str) meeting description
        :param mstatus: (str) meeting status
        :return: meeting id
        """
        print("DATE", mdate)
        cursor = self.conn.cursor()
        query = "INSERT INTO Meeting(mdate, mtime, mname, mdescription, mstatus) " \
            "VALUES (%s, %s, %s, %s, %s) RETURNING mID;"
        cursor.execute(query, (mdate, mtime, mname, mdescription, mstatus,))
        mid = cursor.fetchone()[0]
        self.conn.commit()
        return mid


