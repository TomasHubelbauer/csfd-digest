(window.webpackJsonpcra=window.webpackJsonpcra||[]).push([[0],{14:function(e,t,n){},17:function(e,t,n){"use strict";n.r(t);n(8);var a=n(0),r=n.n(a),c=n(4),l=n(2),u=n.n(l),s=n(5),i=n(1),o=(n(14),n(6)),m=n.n(o);Object(c.render)(r.a.createElement((function(){var e=Object(a.useState)(new Date),t=Object(i.a)(e,2),n=t[0],c=t[1],l=Object(a.useState)([]),o=Object(i.a)(l,2),p=o[0],f=o[1],b=Object(a.useState)(localStorage.getItem("selected-cinemas")?JSON.parse(localStorage.getItem("selected-cinemas")):[]),d=Object(i.a)(b,2),g=d[0],h=d[1],E=Object(a.useState)([]),v=Object(i.a)(E,2),O=v[0],j=v[1],k=Object(a.useState)(),S=Object(i.a)(k,2),w=S[0],x=S[1];Object(a.useEffect)((function(){Object(s.a)(u.a.mark((function e(){var t,n,a,r,l;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch("../data/_.json");case 3:return t=e.sent,e.next=6,t.json();case 6:n=e.sent,a=n.dateAndTime,r=n.cinemas,(l=n.movies).sort((function(e,t){return t.screenings-e.screenings})),c(new Date(a)),f(r),j(l),e.next=19;break;case 16:e.prev=16,e.t0=e.catch(0),x(e.t0);case 19:case"end":return e.stop()}}),e,null,[[0,16]])})))()}));var y=function(e){var t=g.filter((function(t){return t!==e.currentTarget.id}));e.currentTarget.checked&&t.push(e.currentTarget.id),h(t),localStorage.setItem("selected-cinemas",JSON.stringify(t))};if(w)return r.a.createElement("div",null,w.toString());var T=g.map((function(e){return p.indexOf(e)})),I=O.filter((function(e){return e.cinemas.find((function(e){return T.includes(e)}))}));return r.a.createElement("div",null,r.a.createElement("h1",null,"Prague Cinema"),r.a.createElement("p",null,"Built by",r.a.createElement("img",{alt:"",src:"https://hubelbauer.net/favicon.ico"}),r.a.createElement("a",{href:"https://hubelbauer.net",target:"_blank",rel:"noopener noreferrer"},"Tomas Hubelbauer"),".",r.a.createElement("a",{href:"https://github.com/TomasHubelbauer/puppeteer-csfd-scraper",target:"_blank",rel:"noopener noreferrer"},"GitHub")),r.a.createElement("div",null,p.map((function(e){return r.a.createElement(a.Fragment,{key:e},r.a.createElement("input",{type:"checkbox",checked:g.includes(e),id:e,onChange:y}),r.a.createElement("label",{htmlFor:e},e))}))),r.a.createElement("p",null,g.length," cinema",g.length>1?"s":""," selected"),r.a.createElement("p",null,I.length," (",O.length,") movies: (last updated\xa0",r.a.createElement(m.a,{date:n}),")"),I.map((function(e){return r.a.createElement("div",{className:"cinema",key:e.id},r.a.createElement("img",{alt:"".concat(e.name," poster"),src:e.posterUrl+"?h360"}),e.name)})))}),null),document.getElementById("root"))},7:function(e,t,n){e.exports=n(17)},8:function(e,t,n){}},[[7,1,2]]]);
//# sourceMappingURL=main.f66d3566.chunk.js.map