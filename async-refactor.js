/* Functions can be async. However, other functions will still run while waiting for a
promise to complete. To make everything completely syynchronous, get rid of all the 
promises and specify all functions to be async. Then add await keywords to function 
invocations.
*/
// TODO : Get rid of the .then() below, and turn into an await. To do this, createChoiceArray()
// must be an asynchronous function rather than return a promise.

/* Advantage: makes synchronous programming easier. 
Disadvatage: The promises are asynchronous and allow the event loop to continue running. 
*/

/** Returns a promise to get all employee first, last, whole names, as well as ids
 * Each employee is stored as an object in an array, with the properties accessible by 
 * array[i]["first_name"], ["last_name"], ["wholeName"], ["id"] */
async function getEmployeeNamesArrayAsync() {
    // first get employee info from the database
    createChoiceArray("employee", "first_name", "last_name").then(empArray => {
        // console.log("the employee first name and last names array")
        // console.log(empArray);

        // Concatenate the first and last names of each employee, and add to the employee objects returned from the database
        empArray.forEach(elem => {
            elem["wholeName"] = elem["first_name"] + " " + elem["last_name"];
        });
        console.log(empArray)
        return (empArray);
    });
}