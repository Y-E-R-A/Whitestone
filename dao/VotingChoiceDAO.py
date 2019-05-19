from configs.dbconfig import pg_config
import psycopg2

class VotingChoiceDAO:

    def __init__(self):
        """ Database connection """
        connection_url = "dbname=%s user=%s password=%s" % (pg_config['dbname'],

                                                            pg_config['user'],

                                                            pg_config['passwd'])

        self.conn = psycopg2._connect(connection_url)


    def getVotingChoiceByVID(self, vID):
        """
        Return all the alternatives of a voting question with certain vID
        :param vID: voting id
        :return: alternative id, choice and votes count
        """

        cursor = self.conn.cursor()
        query = "SELECT altid, choice, votes " \
                "FROM VotingQuestion inner join VotingChoice " \
                "ON VotingQuestion.vID = VotingChoice.vID " \
                "WHERE VotingQuestion.vID = %s;"
        cursor.execute(query, (vID,))
        result= []
        for row in cursor:
            result.append(row)
        return result



    def getActiveVotingChoiceByVID(self, vID):
        """
        Return all the alternatives of a voting question with certain vID
        :param vID: voting id
        :return: alternatives information of the active voting
        """

        cursor = self.conn.cursor()
        query = "SELECT altid, choice, votes " \
                "FROM VotingQuestion inner join VotingChoice " \
                "ON VotingQuestion.vID = VotingChoice.vID " \
                "WHERE VotingQuestion.vID = %s " \
                "AND vstatus = 'Active';"
        cursor.execute(query, (vID,))
        result = []
        for row in cursor:
            result.append(row)
        return result

    def getVotingChoiceByID(self, altID):
        """
        Search a voting choice by the alternative ID
        :param altID: alternative id
        :return: get choice information
        """

        cursor = self.conn.cursor()
        query = "SELECT altid, choice, votes " \
                "FROM VotingChoice " \
                "WHERE altID = %s;"
        cursor.execute(query, (altID,))
        result = cursor.fetchone()
        return result


    def insertVotingChoice(self, vid, choice, votes):
            """
            Insert a new voting choice or alternative for a voting with an specific vID and return its altID
            :param vid: voting id
            :param choice: choice
            :param votes: votes count (default value = 0)
            :return:
            """

            cursor = self.conn.cursor()
            query = "INSERT INTO VotingChoice(vid, choice, votes) " \
                    "VALUES(%s, %s, %s) RETURNING altID;"
            cursor.execute(query, (vid, choice, votes))
            altID = cursor.fetchone()[0]
            self.conn.commit()
            return altID

    def updateVotingChoice(self, altID):
        """
        Update votes obtained per alternative at the final of the voting
        :param altID: alternative id
        :return:
        """

        cursor = self.conn.cursor()
        query = "UPDATE VotingChoice " \
                "SET votes= votes + 1 " \
                "WHERE altID= %s; "
        cursor.execute(query, (altID,))
        self.conn.commit()
        return 
