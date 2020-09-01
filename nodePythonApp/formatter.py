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
for i in range(1, len(sys.argv)):
    newArr.append(sys.argv[i])

# Perform a function on the array of argument vectors.
def format(columnsArray):
    rowStr = ""
    # print(columnsArray)
    for value in columnsArray:
        rowStr += ("{0:^20}".format(value))
    return rowStr

formatted = format(newArr)
print(formatted)

# flush the print stream
sys.stdout.flush()