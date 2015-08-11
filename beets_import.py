#!/bin/env python

from csv import DictReader
import json
import os
from pprint import pprint

rows = os.popen("cd ~/Music && beet ls -f '$artist	$album	$title	$path' | tail").read().split("\n")
reader = DictReader(rows, fieldnames=["artist", "album", "title", "path"], delimiter="	")
d = []
for row in reader:
    d.append(row)
json.dump(d, open("/tmp/tracks.json", "w"))