from configs.dbconfig import pg_config
import psycopg2
from dao import CredentialDAO

class UsersDAO:

    def __init__(self):
        """Database connection"""
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],
                                                            pg_config['user'],
                                                            pg_config['passwd'])
        self.conn = psycopg2._connect(connection_url)



    def getUser(self, email, pin):
        """
        Return the user information corresponding to an email.
        :param email: (str) UPR email
        :param pin: 4 digits pin
        :return: get all user information
        """

        print(CredentialDAO.AES_KEY);
        cursor = self.conn.cursor()
        query = "SELECT * " \
                "FROM (SELECT uid, cid, ufirstname, ulastname, udescription, urole, uclassification, email, pin " \
                "FROM Users natural inner join Credential " \
                "WHERE email= %s) AS Account " \
                "Where pgp_sym_decrypt(Account.pin::bytea, %s) = %s; "
        cursor.execute(query, (email, str(CredentialDAO.AES_KEY), str(pin),))
        result = cursor.fetchone()
        return result

    def getUserbyEmail(self, email):
        """
        Return the user information corresponding to an email.
        :param email: user UPR email
        :return: the information of the user of the given email
        """

        cursor = self.conn.cursor()
        query = "SELECT uid, cid, ufirstname, ulastname, udescription, urole, uclassification, email, pin " \
                "FROM Users natural inner join Credential " \
                "WHERE email= %s;"
        cursor.execute(query, (email,))
        result = cursor.fetchone()
        return result


    def getUserBycID(self, cID):
        """
        Return the user information corresponding to a cID.
        :param cID:  credential ID
        :return: Return the user information corresponding to a cID.
        """

        cursor = self.conn.cursor()
        query = "SELECT ufirstname, ulastname, udescription, urole, uclassification, email, pin " \
                "FROM Users natural inner join Credential " \
                "WHERE cID= %s;"
        cursor.execute(query, (cID,))
        result = cursor.fetchone()
        return result

    def getUserByuID(self, uID):
        """
        Return the user information corresponding to a uID.
        :param uID:  user ID
        :return: Return the user information corresponding to a uID.
        """
        cursor = self.conn.cursor()
        query = "SELECT ufirstname, ulastname, udescription, urole, uclassification, email, pin " \
                "FROM Users natural inner join Credential " \
                "WHERE uID= %s;"
        cursor.execute(query, (uID,))
        result = cursor.fetchone()
        return result


    def getAllUsersInfo(self):
        """
        :return: Return a list of all registered users.
        """

        cursor = self.conn.cursor()
        query= "SELECT uid, cid, ufirstname, ulastname, udescription, urole, uclassification, email, pgp_sym_decrypt(pin::bytea, %s) as pin " \
               "FROM Users natural inner join Credential"
        cursor.execute(query, (str(CredentialDAO.AES_KEY),))
        result = []
        for row in cursor:
            result.append(row)

        return result

    def getAllSenators(self):
        """
        :return: Return all users with urole= Senator including the Chancellor (senator too)
        """

        cursor = self.conn.cursor()
        query = "SELECT uid " \
                "FROM Users " \
                "WHERE urole= 'Senator' " \
                "OR urole= 'Chancellor'; "
        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)

        return result

    def getAllElectSenators(self):
        """
        :return: Return all users that have are classified as elect senators
        """
        cursor = self.conn.cursor()
        query = "SELECT uid " \
                "FROM Users " \
                "WHERE uclassification= 'Elect Senator';"

        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)

        return result

    def getAllElectStudentSenators(self):
        """
        :return: Return all users that are classified as elect student senators
        """

        cursor = self.conn.cursor()
        query = "SELECT uid " \
                "FROM Users " \
                "WHERE uclassification= 'Elect Student Senator';"

        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)

        return result

    def getAllExOfficioSenators(self):
        """
        :return: Return all users that are classified as Ex-Officio senators
        """

        cursor = self.conn.cursor()
        query = "SELECT uid " \
                "FROM Users " \
                "WHERE uclassification= 'Ex-Officio Senator';"

        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)

        return result

    def getAllExOfficioStudentSenators(self):
        """
        :return: Return all users that are classified as Ex-Officio student senators
        """

        cursor = self.conn.cursor()
        query = "SELECT uid " \
                "FROM Users " \
                "WHERE uclassification= 'Ex-Officio Student Senator';"

        cursor.execute(query)
        result = []
        for row in cursor:
            result.append(row)

        return result


    def insert(self,credentialID, ufirstname, ulastname, udescription, urole, uclassification):
        """
        Insert a new User and return its uID
        :param credentialID: credential ID
        :param ufirstname: user first name
        :param ulastname: user last name
        :param udescription: user description
        :param urole: user role
        :param uclassification: user classification
        :return: uID user ID
        """

        cursor = self.conn.cursor()
        query= "INSERT into Users(cid, ufirstname, ulastname, udescription, urole, uclassification) " \
               "values(%s, %s, %s, %s, %s, %s) RETURNING uID;"
        cursor.execute(query, (credentialID, ufirstname, ulastname, udescription, urole, uclassification,))
        uID = cursor.fetchone()[0]
        self.conn.commit()
        return uID


    def updateUser(self, uID, ufirstname, ulastname, udescription, urole, uclassification):
        """
        Update user information using the uid
        :param uID:  user id
        :param ufirstname: user first name
        :param ulastname: user lastname
        :param udescription: user decsription
        :param urole: user role
        :param uclassification: user classification
        :return: user id
        """
        cursor = self.conn.cursor()
        query= "UPDATE Users "\
               "SET ufirstname= %s, ulastname= %s, udescription= %s, urole= %s, uclassification= %s "\
               "WHERE uID= %s; "
        cursor.execute(query,(ufirstname, ulastname, udescription, urole, uclassification,uID,))
        self.conn.commit()
        return uID


    def deleteUser(self, uID):
        """
        Delete a user object and its credentials in cascade
        :param uID: user id
        :return:
        """

        cursor = self.conn.cursor()
        query = "DELETE FROM Users CASCADE " \
                "WHERE uID= %s RETURNING cID; "
        cursor.execute(query, (uID,))
        cID = cursor.fetchone()[0]

        query = "DELETE FROM Credential " \
                "WHERE cID= %s; "
        cursor.execute(query, (cID,))

        self.conn.commit()
        return

