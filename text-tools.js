const fs = require('fs');

// command arguments
let feature = process.argv[2] || null;
let fnOne = process.argv[3] || null;
// var fnTwo = process.argv[4] || null;

let helpMsg = `
please select feature:
\t-u txtfile - unique sentences by lines
\t-f txtfile - shuffle lines of input file
\t-s txtfile - sort file content by lines
`;

const errMsg = {
    noFeature: new Error(``),
    noFileOne: new Error(`Missing input filename`)
};

if (!feature || !['-s', '-u'].includes(feature)) {
    console.error(errMsg.noFeature);
    return;
}
// console.log(feature, fnOne, fnTwo);

let txtOne = null;
try {
    if (fnOne) txtOne = fs.readFileSync(fnOne, 'utf-8');
    // var txtTwo = (fnTwo)? fs.readFileSync(fnTwo, 'utf-8') : null;    
}
catch (error) {
    console.error(error);
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
    case '-u': {
        if (!txtOne) {
            console.error(errMsg.noFileOne);
            return;
        }

        let txtAryOne = txtOne.split('\n');
        txtAryOne = txtAryOne.filter(sentence => sentence);     // trim empty lines
        txtAryOne = txtAryOne.map(sentence => sentence.trim());
        txtAryOne = [...new Set(txtAryOne)];    // array unique, https://stackoverflow.com/a/14438954

        let filenameSplit = fnOne.split('.');
        let fn = filenameSplit[0] + '_unique.' + filenameSplit[1];

        let err = fs.writeFileSync(fn, txtAryOne.join('\n'));
        if (err)
            console.log(err);
        else
            console.log("file saved as " + fn);
    } break;

    case '-s': {
        // sort
        if (!txtOne) {
            console.error(errMsg.noFileOne);
            return;
        }

        let txtAryOne = txtOne.split('\n');
        txtAryOne = txtAryOne.filter(sentence => sentence);     // trim empty lines
        txtAryOne = txtAryOne.map(sentence => sentence.trim());
        txtAryOne = [...new Set(txtAryOne)];    // array unique, https://stackoverflow.com/a/14438954

        let txtAryShuffle = txtAryOne.sort();

        let filenameSplit = fnOne.split('.');
        let fn = filenameSplit[0] + '_sort.' + filenameSplit[1];

        let err = fs.writeFileSync(fn, txtAryShuffle.join('\n'));
        if (err)
            console.log(err);
        else
            console.log("file saved as " + fn);
    } break;

    case '-f': {
        // shuffle
        if (!txtOne) {
            console.error(errMsg.noFileOne);
            return;
        }

        let txtAryOne = txtOne.split('\n');
        txtAryOne = txtAryOne.filter(sentence => sentence);     // trim empty lines
        txtAryOne = txtAryOne.map(sentence => sentence.trim());
        txtAryOne = [...new Set(txtAryOne)];    // array unique, https://stackoverflow.com/a/14438954

        let txtAryShuffle = arrayShuffle(txtAryOne);

        let filenameSplit = fnOne.split('.');
        let fn = filenameSplit[0] + '_shuffle.' + filenameSplit[1];

        let err = fs.writeFileSync(fn, txtAryShuffle.join('\n'));
        if (err)
            console.log(err);
        else
            console.log("file saved as " + fn); 
    } break;
}

return;
