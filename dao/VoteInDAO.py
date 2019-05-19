from configs.dbconfig import pg_config
import psycopg2



class VoteInDAO:

    def __init__(self):
        """Database connection"""
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],
                                                            pg_config['user'],
                                                            pg_config['passwd'])
        self.conn = psycopg2._connect(connection_url)




    def getParticipant(self, vID, uID):
        """
        Check if the user with uID participates in a particular voting
        :param vID: voting id
        :param uID: user id
        :return: return the exercised_vote flag of a user in certain voting
        """

        cursor = self.conn.cursor()
        query = "SELECT vID, uID, exercised_vote  " \
                "FROM VoteIn " \
                "WHERE vid= %s " \
                "AND uid= %s"
        cursor.execute(query, (vID, uID,))
        result = cursor.fetchone()
        return result


    def insertVoteIn(self, uid, vid):
        """
        Insert the uid of the person who is permitted to vote in a voting with  a specific vID
        :param uid: user id
        :param vid: voting id
        :return:
        """
        cursor = self.conn.cursor()
        query = "INSERT INTO VoteIn(uid, vid, exercised_vote) " \
                "VALUES (%s, %s, %s);"
        cursor.execute(query, (uid, vid, False))
        self.conn.commit()


    def updateVoteInFlag(self, uid, vid):
        """
        Change the exercise_vote flag to TRUE
        :param uid: user id
        :param vid: voting id
        :return:
        """

        cursor = self.conn.cursor()
        query = "UPDATE VoteIn " \
                "SET exercised_vote = %s " \
                "WHERE uID= %s " \
                "AND vID= %s; "
        cursor.execute(query, (True, uid, vid,))
        self.conn.commit()
        return uid

    def getVotingStatusFlag(self, uid, vid):
        """
        Check the flag exercised_vote (if the user already voted or not)
        :param uid: user id
        :param vid: voting id
        :return: voting status flag (exercised_vote)
        """

        cursor = self.conn.cursor()
        query = "SELECT exercised_vote " \
                "FROM VoteIn " \
                "WHERE uID= %s " \
                "AND vID= %s; " \

        cursor.execute(query, (uid, vid,))
        self.conn.commit()
        flag = cursor.fetchone()[0]
        return flag

