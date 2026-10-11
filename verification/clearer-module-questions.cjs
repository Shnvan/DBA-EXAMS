const fs=require('fs'),assert=require('assert/strict'),{X}=require('./load.cjs')();
const prompts=[
 'Display lastName from every record in employees.',
 'Display lastname, firstname and jobtitle from every record in employees, in that column order.',
 'Display contactLastname and contactFirstname from customers. Sort by contactLastname in ascending order.',
 'Display contactLastname and contactFirstname from customers. Sort by contactLastname in descending order, then contactFirstname in ascending order.',
 "Display lastname, firstname and jobtitle from employees whose jobtitle is 'Sales Rep'.",
 "Display lastname, firstname, jobtitle and officeCode from employees whose jobtitle is 'Sales Rep' AND officeCode is 1.",
 "Display lastName, firstName, jobTitle and officeCode from employees whose jobTitle is 'Sales Rep' OR officeCode is 1. Sort by officeCode, then jobTitle, both ascending.",
 'Use BETWEEN to display firstName, lastName and officeCode from employees with officeCode from 1 to 3, including both endpoints. Sort by officeCode in ascending order.',
 "Use LIKE to display firstName and lastName from employees whose lastName ends with 'son'. Sort by firstName in ascending order.",
 'Write a SELECT statement to evaluate <code>1 = 0 AND 1 / 0</code>. Observe how AND stops after a false condition.',
 'Write a SELECT statement to evaluate <code>1 = 1 OR 1 / 0</code>. Observe how OR stops after a true condition.',
 'Write a SELECT statement to evaluate <code>true OR false AND false</code>. Observe which operator is evaluated first.',
 "Display customername, country and state from customers where country is 'USA' AND state is 'CA'.",
 "Display customername, country, state and creditlimit from customers where country is 'USA', state is 'CA', AND creditlimit is greater than 100000.",
 "Display customername, country and creditLimit from customers in 'USA' OR 'France', with creditLimit greater than 100000 in either country. Group the country conditions using parentheses.",
 'Use INNER JOIN to connect members (alias m) and committees (alias c) on their name columns. Display m.member_id, m.name AS member, c.committee_id and c.name AS committee, in that order.',
 'Use INNER JOIN with USING(name) to connect members (alias m) and committees (alias c). Display m.member_id, m.name AS member, c.committee_id and c.name AS committee, in that order.',
 'Use INNER JOIN to connect products (alias t1) and productlines (alias t2) where their productline values match. Display productCode, productName and textDescription, in that order.',
 'Use INNER JOIN with USING(productline) to connect products and productlines. Display productCode, productName and textDescription, in that order.',
 'Use INNER JOIN to connect orderdetails (alias a) and orders (alias b) on orderNumber. For each order, display a.orderNumber, status and SUM(priceEach * quantityOrdered) AS total. Group by a.orderNumber and status. Additional practice: the module shows the result, but not the SQL for this query.',
 'Use LEFT JOIN with USING(name) to connect members (alias m) and committees (alias c), keeping every member. Display m.member_id, m.name AS member, c.committee_id and c.name AS committee, in that order.',
 'Find members who have no matching name in committees. Use members m LEFT JOIN committees c with USING(name) and test c.committee_id for NULL. Display m.member_id, m.name AS member, c.committee_id and c.name AS committee.',
 'Use LEFT JOIN to display all customers and any matching orders, connected by customerNumber. Display customers.customerNumber, customerName, orderNumber and status, in that order.',
 'Use LEFT JOIN with USING(customerNumber) to display all customers and any matching orders. Display customerNumber, customerName, orderNumber and status, in that order.',
 'Find customers who have no orders. Use customers c LEFT JOIN orders o on customerNumber and test o.orderNumber for NULL. Display c.customerNumber, c.customerName, o.orderNumber and o.status.',
 'Use members m RIGHT JOIN committees c on their name columns, keeping every committee record. Display m.member_id, m.name AS member, c.committee_id and c.name AS committee, in that order.',
 'Use customers RIGHT JOIN employees on salesRepEmployeeNumber = employeeNumber, keeping every employee. Display employeeNumber and customerNumber. Sort by employeeNumber in ascending order.',
 'Find employees who have no customers. Use customers RIGHT JOIN employees on salesRepEmployeeNumber = employeeNumber and test customerNumber for NULL. Display employeeNumber and customerNumber, sorted by employeeNumber in ascending order.',
 'Count orders for each status using GROUP BY. Display status and COUNT(*). Use HAVING to include only statuses with more than one order.',
 'Display three different country values from customers using DISTINCT and LIMIT 3.'
];
assert.equal(prompts.length,X.MQ.length);const mq=X.MQ.map((q,i)=>[q[0],prompts[i],...q.slice(2)]);
let html=fs.readFileSync('DBMS_midterm_practice.html','utf8'),a=html.indexOf('const MQ='),b=html.indexOf('const ME=',a);assert(a>0&&b>a);html=html.slice(0,a)+'const MQ='+JSON.stringify(mq)+';\n\n'+html.slice(b);
// Clarify generated tasks without changing their reference SQL.
const changes=[
 ['Retrieve only <b>${k}</b> and <b>${s}</b> from every row.','Display <b>${k}</b> and <b>${s}</b> from every row in ${t}.'],
 ["Retrieve all columns where <b>${e}</b> equals '${ev}'.","Display all columns from ${t} where <b>${e}</b> equals '${ev}'."],
 ["Retrieve rows where ${e} is '${ev}' OR ${n} is greater than ${nv}. Sort by ${n}, then ${s}.","Display all columns from ${t} where ${e} = '${ev}' OR ${n} is greater than ${nv}. Sort by ${n}, then ${s}, both ascending."],
 ['Use BETWEEN to find rows whose <b>${n}</b> is from ${r[0]} to ${r[1]}.','Use BETWEEN to display all columns from ${t} where <b>${n}</b> is from ${r[0]} to ${r[1]}, including both endpoints.'],
 ["Use LIKE to find rows where <b>${s}</b> matches the pattern '${l}'.","Use LIKE to display all columns from ${t} where <b>${s}</b> matches '${l}'."],
 ['Find rows where <b>${nul}</b> is NULL.','Display all columns from ${t} where <b>${nul}</b> is NULL.'],
 ['Rebuild one with a LEFT JOIN and a RIGHT JOIN combined by UNION','Display matching and unmatched rows using a LEFT JOIN and a RIGHT JOIN combined by UNION'],
 ['Show ${g} and the count.','Display ${g} and COUNT(*), in that order.'],
 ['MySQL must reject it','MariaDB must reject it'],['MySQL must refuse','MariaDB must reject it']
];
for(const[a,b]of changes){assert(html.includes(a),a);html=html.replaceAll(a,b)}
fs.writeFileSync('DBMS_midterm_practice.html',html);console.log('All 30 Module questions and generated question templates clarified.');
