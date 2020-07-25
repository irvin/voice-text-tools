Tools to modify sentences data of Common Voice project
=========================

(MIT License)

### combine all txt files inside folders into all.txt
```
✗ node text-tools.js -a ./
file saved as all.txt
```

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

### calculate the phonetics coverage of sentences with input method table

Count total numbers of phonetics within the input method table `*.cin` file, and calculating coverage rate of sentences file.

```
✗ node text-tools.js -c all.txt CnsPhonetic2016-08v2.cin
Total numbers of phonetic in CnsPhonetic2016-08v2.cin are 1567
Numbers of phonetic from 2015 characters in all.txt are 861
We have cover 54.95% of the pronunciations.
```

### calculate the syllable coverage of sentences (and ignore specific keys)

Ignore some specific keys, eg., tones (ˇˋˊ˙) in Chinese Zhuyin (key 3,4,6,7) 

```
✗ node text-tools.js -c all.txt CnsPhonetic2016-08v2.cin -i 3,4,6,7 
Total numbers of phonetic in CnsPhonetic2016-08v2.cin are 483
Numbers of phonetic from 2015 characters in all.txt are 369
We have cover 76.4% of the pronunciations.
```


### calculate the coveraged rate of chars from first txt to second txt, and list all missing chars

```
✗ node text-tools.js -o all.txt 教育部4808常用字.txt
Numbers of chars in all.txt are 2905
Numbers of chars in 教育部4808常用字.txt are 4808
--------------------
all.txt includes 2683 chars from 教育部4808常用字.txt (55.8%)
all.txt missing 2125 chars from 教育部4808常用字.txt (44.2%):
[丑,丐,丕,丞,丫,丸,么,尹,乍,乒,乓,乞,乩,于,云,亙,亟,亨,仃,仄......
```
