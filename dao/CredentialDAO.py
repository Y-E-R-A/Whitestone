from configs.dbconfig import pg_config

import psycopg2

class CredentialDAO:
    """
    Credentials DAO store the queries for the CRUD operations of new and existing
    Whitestone users.
    """

    global AES_KEY
    AES_KEY = 'Whitestone50472019'

    def __init__(self):
        """ Database connection """
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],
                                                            pg_config['user'],
                                                            pg_config['passwd'])
        self.conn = psycopg2._connect(connection_url)


    def getAllCredentials(self):
        """
        Search the email, and pin of all users registered
        :return: If exists, return all the credentials
        """
        cursor = self.conn.cursor()
        query = "SELECT email, pgp_sym_decrypt(pin::bytea, %s) as pin FROM Credential;"
        cursor.execute(query, (AES_KEY,))
        result = []
        for row in cursor:
            result.append(row)
        return result


    def getCredentialByEmail(self, email):
        """
        Search all credential information (cID, email, pin) of a user with certain email
        :param email: (stn) UPR email
        :return: cID, email, and decrypted pin
        """
        print(AES_KEY);
        cursor = self.conn.cursor()
        query = "SELECT cID, email, pgp_sym_decrypt(pin::bytea, %s) as pin FROM Credential WHERE email = %s;"
        cursor.execute(query, (AES_KEY, email,))
        result = []
        for row in cursor:
            result.append(row)
        return result


    def insert(self, email, pin):
        """
        Insert new user's credentials (email and pin)
        :param email: (str) UPR email
        :param pin: (int) 4 digits pin
        :return: credential ID
        """
        cursor = self.conn.cursor()
        query = " INSERT INTO Credential(email, pin) " \
                "VALUES (%s, pgp_sym_encrypt(%s, %s)::char varying) returning cID;"
        cursor.execute(query, (email, str(pin), str(AES_KEY),))
        cID = cursor.fetchone()[0]
        self.conn.commit()
        return cID


    def updateCredentials(self, email, pin, cID):
        """
        Update email and pin which belongs to a user with certain cID
        :rtype: object
        :param email: (str) UPR email
        :param pin: (int) 4 digits
        :param cID: (int) credential ID
        :return: credential ID
        """

        cursor = self.conn.cursor()
        query = "UPDATE Credential " \
                "SET email= %s, pin = pgp_sym_encrypt(%s, %s)::char varying " \
                "WHERE cID = %s;"
        cursor.execute(query, (email, str(pin), str(AES_KEY), cID, ))
        self.conn.commit()
        return cID



