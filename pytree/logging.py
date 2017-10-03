# -*- coding: utf-8 -*-
from datetime import datetime
import os

def log_profiles(log_folder, coords):
    
    print(log_folder)
    today = datetime.now()
    strDate = str(today.date())
    current_log_file = log_folder + '/' + strDate + ' profiles_log.txt'

    
    if os.path.isfile(current_log_file):
        f = open(current_log_file, 'a')
        f.write(str(today) + ',' + str(coords) + '\n')
        print("ici")
        f.close()
    else:
        print("la")
        f = open(current_log_file, 'w')
        f.write(str(today) + ',' + str(coords) + '\n')
        f.close()


    