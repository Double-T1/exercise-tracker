# my live app (https://handy-navy-cement.glitch.me/)
# a sucessful demo (https://exercise-tracker.freecodecamp.rocks/)


#The User Story
1.You should provide your own project, not the example URL.
2.You can POST to /api/users with form data username to create a new user. The returned response will be an object with username and _id properties.
3.You can make a GET request to /api/users to get an array of all users. Each element in the array is an object containing a user's username and _id.
4.You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used. The response returned will be the user object with the exercise fields added.
5.You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user. The returned response will be the user object with a log array of all the exercises added. Each log item has the description, duration, and date properties.
6. A request to a user's log (/api/users/:_id/logs) returns an object with a count property representing the number of exercises returned.
7. You can add from, to and limit parameters to a /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
