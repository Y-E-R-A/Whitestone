from configs.dbconfig import pg_config
import psycopg2

class ActivityLogDAO:
    """
    This class contain the queries for the activity logs entity of the Whitestone app
    that insert and retrieve the activity log information during the use of the app.
    """

    def __init__(self):
        """ Database connection """
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],
                                                            pg_config['user'],
                                                            pg_config['passwd'])

        self.conn = psycopg2._connect(connection_url)


    def getActivityLogByDate(self, date):
        """
        Return all the activities that occurs in certain date
        :param date: DD/MM/YYYY
        :return: If exists, activity log result
        """

        cursor = self.conn.cursor()
        query = "SELECT date, time, urole, uemail, logmessage " \
                "FROM ActivityLog " \
                "WHERE ActivityLog.date = %s;"
        cursor.execute(query, (date,))
        result = []
        for row in cursor:
            result.append(row)
        return result


    def insertActivityLog(self, urole, uemail, date, time, logmessage):
        """
        Insert new activity log using the email as identifier and user role.
        A message describing the activity is recorded and the date and time
        in which the activity occurs.
        :param urole: (str) Senator, Chancellor, Administrator or Secretary
        :param uemail: (str) xxxxxx@upr.edu
        :param date: (str) DD/MM/YYYY format in which the action was performed
        :param time: (time)  time in which the action was performed
        :param logmessage: (str) message representing the action done.
        :return: activity log ID
        """

        cursor = self.conn.cursor()
        query = " INSERT INTO ActivityLog(urole, uemail, date, time, logmessage) " \
                "VALUES (%s, %s, %s, %s, %s) RETURNING logID;"
        cursor.execute(query, (urole, uemail, date, time, logmessage,))
        logID = cursor.fetchone()[0]
        self.conn.commit()
        return logID