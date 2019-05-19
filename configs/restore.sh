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

get_Backup_File(){
						# Get the backup files path
	read -p "Enter the Whitestone server-side backup file absolute path:" path
	echo $path				# Resturn the Whitestone Project backup path value
}

untar_Backup_File(){

	echo "Backup file path: $1"		# Backup file was found
	tar -xvf $1 -C /var/www/html/           # Extract the contents of path to the directory specified 
	if  [ $? = "0" ]; then 
		echo "Extract Complete"		# If "0" restore was a sucess
	else
		echo "Extract Error" 		# Otherwise an error occurred
	fi
}

get_DB_Backup_File(){
						# Get the DB backup files path
	read -p "Enter the Whitestone database backup file absolute path:" path
	echo $path				# Return the Whitestone database backup file path
}

restoreDB(){

	DB_Name="whitestone"			# The database name
	DB_Admin="whitestoneadmin"		# The database administrator


						# Preparing folder for the backup
	if  [ -f /var/lib/postgresql/Backups ]; then 
		mkdir /var/lib/postgresql/Backups 
	fi

	#if [ $1 != "/var/lib/postgresql/Backups" ]; then 
	#	mv $path /var/lib/postgresql/Backups 	# Move backup file to the destination folder
	#fi

	psql $DB_Name -U $DB_Admin -W< $1	# Perform the backup process

	if  [ $? = "1" ]; then 
		echo "Restore error"		# If "1" an error occurred
	else
		echo "Restore Complete" 	# If "0" restores was a success
	fi

}

createDB(){

	DB_Name="whitestone"			# The database name
	DB_Admin="whitestoneadmin"		# The database administrator
	sudo -u postgres dropdb --if-exists $DB_Name	# Drop the whitetsone db if exist
	sudo -u postgres createdb $DB_Name		# Create a new db named whitestone

}

path=$(get_Backup_File)
while [ ! -f $path ]	 			# Loop until backup path exists
do	
	echo "ERROR: File $path not exists" 	# Otherwise the file does not exists
	get_Backup_File				# Call recursively the function until the input path is correct
done 

untar_Backup_File $path				# Call function to extract the tar backup file

path=$(get_DB_Backup_File)
while [ ! -f $path ]	 			# Loop until backup path exists
do	
	echo "ERROR: File $path not exists" 	# Otherwise the file does not exists
	get_DB_Backup_File			# Call recursively the function until the input path is correct
done 


createDB 					# Call the function to drop and create a empty db to for the restore
restoreDB $path					# Restore all the existing data from the .bak file
	
	 

exit 0						# End of the script
