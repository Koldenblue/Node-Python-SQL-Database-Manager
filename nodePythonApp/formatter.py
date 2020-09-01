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

import sys
# this python file is intended to be passed an argument vector which is an array


# create a new array and add the argument vectors to it.
newArr = []
longestStr = 0
for i in range(2, len(sys.argv)):
    newArr.append(sys.argv[i])
    if len(sys.argv[i]) > longestStr:
        longestStr = len(sys.argv[i])

# Perform a function on the array of argument vectors to format into a table.
def format(columnsArray):
    numColumns = int(sys.argv[1])

    rowStr = "\n"
    counter = 0
    for value in columnsArray:
        rowStr += ("{0:^20}".format(value))
        counter += 1
        if counter % numColumns == 0:
            print(rowStr)
            rowStr = ""
        if counter == numColumns:
            rowStr += "_" * numColumns * 20 + "\n"

format(newArr)

# flush the print stream
sys.stdout.flush()