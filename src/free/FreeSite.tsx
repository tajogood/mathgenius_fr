import App from '../App.tsx';

// Every mathematics lesson, graphic, manipulation and assessment is the EXACT
// same App component used in MathGenius. Only cloud membership is omitted.
// Original App's default cloudMode=false persists progress in browser storage.
function initialGrade(){
  const params=new URLSearchParams(window.location.search);
  const n=Number(params.get('grade'));
  return Number.isInteger(n)&&n>=1&&n<=6?n:5;
}
export default function FreeSite(){
  return <App initialGrade={initialGrade()}/>;
}
