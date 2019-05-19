
#!/bin/bash				

##############################################################################################
# Author: Yomaira Rivera Albarran                                                            #   
# Updated: 4/25/2019                                                                         #
# Purpose: This script is used to backup the Whitestone application                          #
#          (server-side and audio files), and the whitestone database                        #
# Instructions: Open the terminal paste the following commands:                              #
#       >> chmod +x <path of this script>                                                    #
#          (Example:chmod +x /var/www/Whitestone_Backups/backup.sh)                          #
#	>> /var/www/Whitestone_Backups/backup.sh                                             #
##############################################################################################



##############################################################################################
#                                                                                            #
#                                     Whitestone Database                                    #
##############################################################################################


if [ "$(whoami)" != "root" ]			# Request to login as sudo
then
    sudo su -s "$0"
    exit
fi

echo "***WHITESTONE DATABASE BACKUP***"

DATE=`date +%d%m%Y` 				# Backup date
TIME=`date +"%d%m%Y_%H%M"`			# Backup date and time
DIR=/var/www/Whitestone_Backups/${TIME}/	# Default destination of backup
DB_Name="whitestone"				# The database name
DB_Admin="whitestoneadmin"			# The database administrator
FILENAME=${DB_Name}_${DATE}.sql			# The database backup name


echo "The default directory to backup Whitestone Application is:"$DIR		 
read -p "Do you want to change the directory? Enter yes or no:" input

while [ $input ! = "yes" ] && [ $input ! = "no" ]	# Validate the input yes or no
do
	read -p "Do you want to change the directory? Enter yes or no:" input
done

if [ $input = "yes" ]			# The user wants to change backup directory
	then read -p "Enter the new directory to backup Whitestone DB:" Dir
	echo $DIR			# Display the new directory selected by user
else 

	echo "The backup will be performed in the default directory"
fi
	
 
mkdir -p $DIR				# Creating Backups Directory if not exist
path=${DIR}${FILENAME}			# The database backup full path

echo "Enter the $DB_Admin user password"
pg_dump $DB_Name -U $DB_Admin > $path	# Postgresql Whitestone DB dump or backup instruction
if  [ $? = "1" ]; then 			# Check for errors
	echo "Backup error"		# If "1" and errors occurred
else
	echo "Backup Complete:" $path 	# If "0" the db backup was a success
fi


#gzip $filename

##############################################################################################
#                                                                                            #
#                                 Whitestone App Backup                                      #
##############################################################################################

APP_NAME=whitestone                        # The application directory name
APP=${APP_NAME}_${DATE}.tar.gz             # The application backup name including the date.
SRCDIR=/var/www/html                       # Source backup folder.
tar -cvf $DIR/$APP -C $SRCDIR Whitestone   # Create a tar compressed file    
if  [ $? = "1" ]; then 			   # If "1" and errors occurred
	echo "Whitestone Backup Error"
else					   # If "0" the db backup was a success
	echo "Whitestone Backup Complete:" ${DIR}${APP} 
fi


exit 0
