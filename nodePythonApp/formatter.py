# CODE FOR IMPORTING TO AND FROM NODE
'''
const { spawn } = require("child_process");
# Use 'py' as the program (must be in PATH). Formatter.py is the python filename. After that are argument vectors.
let py = spawn("py", ["./formatter.py", "H", "I"]);
py.stdout.on('data', (data) => {
    data = data.toString()
    console.log(data)
})
'''
# careful! Python will not trace errors as normal when passing data to node.
# One viable option could be to import the error logging module.

import sys
# this python file is intended to be passed an argument vector which is an array


# create a new array and add the argument vectors to it.
newArr = []
columnLength = 25
for i in range(2, len(sys.argv)):
    if len(sys.argv[i]) > columnLength:
        sys.argv[i] = sys.argv[i][0:columnLength]
    newArr.append(sys.argv[i])

def format(columnsArray):
    ''' Format an array of argument vectors to format into a table.'''
    numColumns = int(sys.argv[1])

    rowStr = "\n"
    counter = 0
    for value in columnsArray:
        rowStr += ("{0:^25}".format(value))
        counter += 1
        if counter % numColumns == 0:
            print(rowStr)
            rowStr = ""
        if counter == numColumns:
            rowStr += "_" * numColumns * columnLength + "\n"

format(newArr)

# flush the print stream - emits a data event, for which node.js is listening for
sys.stdout.flush()