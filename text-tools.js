const fs = require('fs');
const path = require('path');

const availFeatures = ['-a', '-s', '-u', '-f', '-c', '-o', '-d'];

// command arguments
const args = process.argv || null;
const [feature, fnOne, fnTwo] = args.slice(2);

let helpMsg = `
please select feature:
\t-a folders - combine all txt files inside folder into all.txt
\t-u txtfile - unique sentences by lines
\t-f txtfile - shuffle lines of input file
\t-s txtfile - sort file content by lines
\t-c txtfile input_method.cin - use input method table to calculate pronunciation coverage rate of txtfile
\t-o txtfile txtref.txt - calculate how many chars from char_list.txt appearing in txtfile
\t-d folder - find duplicate sentences across all txt files in folder
`;

const errMsg = {
    noFeature: new Error(`Please specify a feature to use: -a, -s, -u, -f, -c, -o, or -d`),
    noFileOne: new Error(`Please provide a file or directory as the first argument`),
    noFileContent: new Error(`Didn't find any sentences in the file`),
    noFileTwo: new Error(`Please provide a second file as the second argument`)
};

if (!feature || !availFeatures.includes(feature)) {
    console.error(errMsg.noFeature);
    console.log(helpMsg);
    return;
}
if (!fnOne) {
    console.error(errMsg.noFileOne);
    console.log(helpMsg);
    return;
}
// console.log('feature, fnOne, fnTwo:', feature, fnOne, fnTwo);

function requireSecondFile(feature, fnTwo) {
    if (!fnTwo) {
        console.error(errMsg.noFileTwo);
        return false;
    }
    return true;
}

function getTxtFilesInPathSync(currentDirPath) {
    let txtFiles = [];
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && path.extname(name) === '.txt')
            txtFiles.push(filePath);
        else if (stat.isDirectory())
            txtFiles = txtFiles.concat(getTxtFilesInPathSync(filePath));
    });
    return txtFiles;
}

function preProcessSentences(text) {
    let sentences = text.split('\n');
    sentences = sentences.filter(sentence => sentence);    // trim empty lines
    sentences = sentences.map(sentence => sentence.trim());
    return sentences;
}

function getUniqueSentences(sentences) {
    return [...new Set(sentences)];    // array unique, https://stackoverflow.com/a/14438954
}

function writeToFile(content, filename) {
    try {
        fs.writeFileSync(filename, content, 'utf-8');
        console.log("file saved as " + filename);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

function generateOutputFilename(inputFile, suffix) {
    let filenameSplit = inputFile.split('.');
    return filenameSplit[0] + suffix + '.' + filenameSplit[1];
}

function extractUniqueChars(text) {
    let allCharObj = {};
    text.split('').forEach(char => {
        allCharObj[char] = 1;
    });
    return Object.keys(allCharObj);
}

let txtOne = '', txtTwo = '';
try {
    let txtFiles = [fnOne];
    if (fs.statSync(fnOne).isDirectory())
        txtFiles = getTxtFilesInPathSync(fnOne);

    // console.log('txtFiles:', txtFiles);
    txtFiles.forEach(function(fileName) {
        txtOne += fs.readFileSync(fileName, 'utf-8') + '\n';
    });

    if (fnTwo)
        txtTwo = fs.readFileSync(fnTwo, 'utf-8');
}
catch (error) {
    console.error(error);
    return;
}

if ((!txtOne) || (fnTwo && !txtTwo)) {
    console.error(errMsg.noFileContent);
    return;
}

function arrayShuffle(a) {  // https://stackoverflow.com/a/6274381
    let b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
}

switch (feature) {
    case '-o': {
        if (!requireSecondFile(feature, fnTwo)) {
            return;
        }

        let charsOne = extractUniqueChars(txtOne);
        let charsTwo = extractUniqueChars(txtTwo);

        // check how many chars from charsTwo appear in charsOne
        let charsTwoCoverStat = charsTwo.map(function(char) {
            return charsOne.includes(char);
        });

        // list chars in charTwo which is not available in charOne
        let missingChars = [];
        let availChars = [];

        for (const index in charsTwo) {
            if (charsTwoCoverStat[index])
                availChars.push(charsTwo[index]);
            else
                missingChars.push(charsTwo[index]);
        }

        let coverRate = Math.round(availChars.length/charsTwo.length*1000)/10;
        let missRate = Math.round(missingChars.length/charsTwo.length*1000)/10;

        console.log(`Numbers of chars in ${fnOne} are ${charsOne.length}`);
        console.log(`Numbers of chars in ${fnTwo} are ${charsTwo.length}`);
        console.log(`--------------------`);
        console.log(`${fnOne} includes ${availChars.length} chars from ${fnTwo} (${coverRate}%)`);
        console.log(`${fnOne} missing ${missingChars.length} chars from ${fnTwo} (${missRate}%):`);
        console.log(`[${missingChars}]`);
    } break;

    case '-c': {
        if (!requireSecondFile(feature, fnTwo)) {
            return;
        }

        // read cin table and convert to obj map of char to phonetic
        let [cinObj, phoneticNum] = function(cinFile){
            let cinTable = cinFile.split('\n');
            cinTable = cinTable.filter(line => { return !['#', '%'].includes(line[0]); });
            cinTable = cinTable.filter(line => { return (line.length > 0); });
            let cinObj = {};
            let allPhonetic = {};
            let ignore = [];
            let ignoreRegex = null;

            // ignore specific tones in .cin, eg. "3,4,6,7" in Chinese Zhuyin
            if (args[5] == '-i' && args[6]) {
                ignore = args[6].split(',');
                ignoreRegex = new RegExp(ignore.join('|'));
            }

            cinTable.forEach(line => {
                let [phe, char] = line.split(/\s|\t/);
                let pheStr = phe.toString();
                if (ignoreRegex) pheStr = pheStr.replace(ignoreRegex, '');
                cinObj[char] = pheStr;
                allPhonetic[pheStr] = 1;
            });
            return [cinObj, Object.keys(allPhonetic).length];
        }(txtTwo);

        // read sentences file and convert to non-repeat chars array
        let allCharAry = extractUniqueChars(txtOne);

        let allPhoneObj = {};
        allCharAry.forEach(cha => { allPhoneObj[cinObj[cha]] = 1; });
        let allPhoneLen = Object.keys(allPhoneObj).length;   // all non-repeat phonetic

        console.log(`Total numbers of phonetic in ${fnTwo} are ${phoneticNum}`);
        console.log(`Numbers of phonetic from ${allCharAry.length} characters in ${fnOne} are ${allPhoneLen}`);
        console.log(`We have cover ${Math.round(allPhoneLen/phoneticNum*10000)/100}% of the pronunciations.`);
    } break;

    case '-a': {
        let txtAryOne = preProcessSentences(txtOne);
        writeToFile(txtAryOne.join('\n'), 'all.txt');
    } break;

    case '-u': {
        let txtAryOne = preProcessSentences(txtOne);
        txtAryOne = getUniqueSentences(txtAryOne);
        let outputFile = generateOutputFilename(fnOne, '_unique');
        writeToFile(txtAryOne.join('\n'), outputFile);
    } break;

    case '-s': {
        // sort
        let txtAryOne = preProcessSentences(txtOne);
        txtAryOne = getUniqueSentences(txtAryOne);
        let sortedSentences = txtAryOne.sort();
        let outputFile = generateOutputFilename(fnOne, '_sort');
        writeToFile(sortedSentences.join('\n'), outputFile);
    } break;

    case '-f': {
        // shuffle
        let txtAryOne = preProcessSentences(txtOne);
        txtAryOne = getUniqueSentences(txtAryOne);
        let shuffledSentences = arrayShuffle(txtAryOne);
        let outputFile = generateOutputFilename(fnOne, '_shuffle');
        writeToFile(shuffledSentences.join('\n'), outputFile);
    } break;

    case '-d': {
        // find duplicate sentences across all txt files in folder
        if (!fs.statSync(fnOne).isDirectory()) {
            console.error(`Error: ${fnOne} is not a directory`);
            return;
        }

        let txtFiles = getTxtFilesInPathSync(fnOne);
        if (txtFiles.length === 0) {
            console.log(`No txt files found in ${fnOne}`);
            return;
        }

        console.log(`Found ${txtFiles.length} txt files in ${fnOne}:`);
        txtFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
        console.log('');

        let sentenceMap = new Map();
        let totalSentences = 0;

        txtFiles.forEach(filePath => {
            let content = fs.readFileSync(filePath, 'utf-8');
            let sentences = preProcessSentences(content);

            totalSentences += sentences.length;

            sentences.forEach(sentence => {
                if (!sentenceMap.has(sentence)) {
                    sentenceMap.set(sentence, []);
                }
                sentenceMap.get(sentence).push(path.basename(filePath));
            });
        });

        let duplicates = [];
        let uniqueSentences = 0;

        sentenceMap.forEach((files, sentence) => {
            if (files.length > 1) {
                duplicates.push({
                    sentence: sentence,
                    files: files,
                    count: files.length
                });
            } else {
                uniqueSentences++;
            }
        });

        // 輸出統計結果
        console.log(`=== 重複句子檢測結果 ===`);
        console.log(`總句子數: ${totalSentences}`);
        console.log(`唯一句子數: ${uniqueSentences}`);
        console.log(`重複句子數: ${duplicates.length}`);
        console.log(`重複率: ${Math.round(duplicates.length / sentenceMap.size * 1000) / 10}%`);
        console.log('');

        if (duplicates.length > 0) {
            console.log(`=== 重複句子列表 ===`);
            // 按重複次數排序
            duplicates.sort((a, b) => b.count - a.count);

            duplicates.forEach((dup, index) => {
                console.log(`${index + 1}. 句子: "${dup.sentence}"`);
                console.log(`   出現 ${dup.count} 次，檔案: ${dup.files.join(', ')}`);
                console.log('');
            });
        }
        else {
            console.log('沒有發現重複句子！');
        }
    } break;
}

return;
