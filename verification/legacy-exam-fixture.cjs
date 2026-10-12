/* Exact v6 question bank captured before the PDF audit. SQL source is unchanged. */
const fs=require('fs'),path=require('path'),bank=require('./fixtures/exam-v6-bank.json');
module.exports=function legacyExamHTML(){
 const current=fs.readFileSync(path.join(__dirname,'..','DBMS_midterm_practice.html'),'utf8');
 return current.replace(/const EXAM_RETIRED=\{[^;]+;/,'const EXAM_RETIRED={id:[],mc:[]};')
  .replace("const CONTENT_VERSION='pdf-wording-home-v7';",'ID.splice(0,ID.length,...'+JSON.stringify(bank.ID)+');MC.splice(0,MC.length,...'+JSON.stringify(bank.MC)+');\nconst CONTENT_VERSION=\'single-question-exam-v6\';');
};
