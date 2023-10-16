# dynamodb-enhanced-demo

VisitsDAO using lib-dynamodb.

//Note: Do not get lib-dynamodb and client-dynamodb mixed up. lib-dynamodb is a layer on top of client-dynamodb that enables the programmer to write more simple queries and then translates those queries and sends them to client-dynamodb.

//IMPORTANT: Make sure that all calls to dynamodb use an await statement, otherwise the print output will not match as functions will be called in the wrong order.

Output:

```
(Just getting) Matt has visited Guatemala 0 time(s)
(After recording) Matt has visited Guatemala 1 time(s)
(After recording) Matt has visited utah 1 time(s)
(After deletion) Matt has visited utah 0 time(s)
Matt has visited: Visit{visitor='matt', location='guatemala', visit_count=1}, Visit{visitor='matt', location='idaho', visit_count=1}, and are there more pages? true
Matt has also visited: [Visit{visitor='matt', location='italy', visit_count=1}], and are there more pages? false
Italy was visited by: [Visit{visitor='adam', location='italy', visit_count=1}, Visit{visitor='elliot', location='italy', visit_count=1}], and are there are more pages? true
Italy was also visited by: [Visit{visitor='matt', location='italy', visit_count=1}, Visit{visitor='nate', location='italy', visit_count=1}], and are there are more pages? false
```
