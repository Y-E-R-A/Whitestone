from configs.dbconfig import pg_config
import psycopg2

class RequestsDAO:


    def __init__(self):
        """ Database connection """
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],
                                                            pg_config['user'],
                                                            pg_config['passwd'])
        self.conn = psycopg2._connect(connection_url)


    def insertRequest(self, uID, request, approval):
        """
        :param uID: user identifier
        :param request: boolean that indicates if the user is waiting for its
        turn or just cancelled it. Default value is True.
        :param approval:  Flag that indicates if the turn has been granted
        :return: request or turn ID
        """
        cursor = self.conn.cursor()
        query = "INSERT into Turn(uid, request, approval) " \
                "VALUES(%s, %s, %s) RETURNING rID;"
        cursor.execute(query, (uID, request, approval,))
        rID = cursor.fetchone()[0]
        self.conn.commit()
        return rID

    def deleteRequest(self, uID):
        """
        Delete a user speak request, and thus eliminate him from the list
        :param uID: user ID
        :return:
        """

        cursor = self.conn.cursor()
        query = "DELETE FROM Turn " \
                "WHERE uID= %s; "
        cursor.execute(query, (uID,))
        self.conn.commit()
        return

    def getApprovalStatusByuID(self, uID):
        """
        Check if the user's turn is on wait, Accept or Deny status.
        :param uID: user ID
        :return: approval flag and the first and lastname of the user
        """

        cursor = self.conn.cursor()
        query = "SELECT approval, ufirstname, ulastname " \
                "FROM Turn NATURAL INNER JOIN Users " \
                "WHERE uID= %s; "
        cursor.execute(query, (uID,))
        self.conn.commit()
        result = cursor.fetchone()
        return result

    def getRequestStatusByuID(self, uID):
        """
        Check if the user's has a request to speak.
        :param uID: user identifier
        :return: request (boolean) flag
        """
        cursor = self.conn.cursor()
        query = "SELECT request, ufirstname, ulastname " \
                "FROM Turn NATURAL INNER JOIN Users " \
                "WHERE uID= %s; "
        cursor.execute(query, (uID,))
        self.conn.commit()
        result = cursor.fetchone()
        return result

    def getRequestByuID(self, uID):
        """
        Check if the user requested a turn to speak
        :param uID: user id
        :return: request information
        """

        cursor = self.conn.cursor()
        query = "SELECT * " \
                "FROM Turn " \
                "WHERE uID= %s " \
                "AND request = %s; "
        cursor.execute(query, (uID, True))
        self.conn.commit()
        result = cursor.fetchone()
        return result

    def getRequests(self):
        """
        Get the list with the turns to speak
        :return: waiting list
        """
        cursor = self.conn.cursor()
        query = "SELECT rID, uID, request, approval, ufirstname, ulastname " \
                "FROM Turn natural inner join Users; "

        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)

        return result

    def truncateTurnTable(self):
        """
        Delete all information from the speak request list
        :return:
        """
        cursor = self.conn.cursor()
        query = "TRUNCATE TABLE Turn; "
        cursor.execute(query)
        self.conn.commit()
        return

    def grantTurn(self, uID):
        """
        Set the approval status of the user to "Accept" to enable their microphone
        :param uID: user ID
        :return: approval flag
        """
        cursor = self.conn.cursor()
        query = "UPDATE Turn " \
                "SET approval= %s " \
                "WHERE uID = %s" \
                "RETURNING approval; "
        cursor.execute(query, ("Accept", uID,))
        self.conn.commit()
        approval = cursor.fetchone()
        return approval

    def denyTurn(self, uID):
        """
        Set the approval status of the user to "Deny" to enable their microphone
        :param uID: user ID
        :return: approval flag
        """

        cursor = self.conn.cursor()
        query = "UPDATE Turn " \
                "SET approval= %s " \
                "WHERE uID = %s" \
                "RETURNING approval; "
        cursor.execute(query, ("Deny", uID,))
        self.conn.commit()
        approval = cursor.fetchone()
        return approval
