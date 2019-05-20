#!/bin/bash



##############################################################################################
# Author: Yomaira Rivera Albarran                                                            #
# Updated: 4/26/2019                                                                         #
# Purpose: This script is used to restore the Whitestone application                         #
#          (server-side and audio files), and the whitestone database                        #
# Instructions: Open the terminal paste the following commands:                              #
#       >> chmod +x <path of this script>                                                    #
#          (Example:chmod +x /var/www/Whitestone_Backups/restore.sh)                         #
#	>> /var/www/Whitestone_Backups/restore.sh                                            #
##############################################################################################




if [ "$(whoami)" != "root" ]			# Check if the user is root
then
    sudo su -s "$0"				# Request to login as sudo
    exit
fi


echo "***WHITESTONE APPLICATION RESTORE***"



restoreDB(){

	DB_Name="whitestone"			# The database name
	DB_Admin="whitestoneadmin"		# The database administrator
	DB_dump_path="whitestone_clean_dump.sql"


						# Preparing folder for the backup
	if  [ -f /var/lib/postgresql/Backups ]; then
		mkdir /var/lib/postgresql/Backups
	fi

	psql $DB_Name -U $DB_Admin -W< $DB_dump_path  # Perform the backup process

	if  [ $? = "1" ]; then
		echo "Dump error"		# If "1" an error occurred
	else
		echo "Dump Complete" 	# If "0" restores was a success
	fi

}

createDB(){

	DB_Name="whitestone"			# The database name
	DB_Admin="whitestoneadmin"		# The database administrator
	sudo -u postgres dropdb --if-exists $DB_Name	# Drop the whitetsone db if exist
	sudo -u postgres createdb $DB_Name		# Create a new db named whitestone

}



createDB 					# Call the function to drop and create a empty db to for the restore
restoreDB					# Restore all the existing data from the .sql clean file
git clone "https://github.com/Y-E-R-A/Whitestone.git" /var/www/html/

exit 0						# End of the script
