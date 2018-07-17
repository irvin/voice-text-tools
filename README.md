Tools to modify sentences data of Common Voice project
=========================

(MIT License)

### remove duplicate sentences in txt file
```
✗ node text-tools.js -u all.txt
file saved as all_unique.txt
```

### sort sentences in txt file
```
✗ node text-tools.js -s all.txt
file saved as all_sort.txt
```

### shuffle sentences of txt file
```
✗ node text-tools.js -f all.txt
file saved as all_shuffle.txt
```

### calculate the phonetics coverage of sentences

count total numbers of phonetics within the input method `*.cin` file, and calculating coverage rate of sentences file.

```
✗ node text-tools.js -c all.txt CnsPhonetic2016-08v2.cin
Total numbers of phonetic in CnsPhonetic2016-08v2.cin are 1567
Numbers of phonetic from 2015 characters in all.txt are 861
We have cover 54.95% of the pronunciations.
```
