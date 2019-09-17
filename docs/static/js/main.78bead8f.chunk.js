(window.webpackJsonpcra=window.webpackJsonpcra||[]).push([[0],{11:function(e,t,n){e.exports=n(21)},12:function(e,t,n){},18:function(e,t,n){},21:function(e,t,n){"use strict";n.r(t);n(12);var a=n(0),r=n.n(a),i=n(3),c=n(1),l=n.n(c),s=n(4),o=n(5),u=n(6),m=n(9),d=n(7),p=n(10),f=(n(18),n(8)),h=n.n(f),v=function(e){function t(){var e,n;Object(o.a)(this,t);for(var a=arguments.length,r=new Array(a),i=0;i<a;i++)r[i]=arguments[i];return(n=Object(m.a)(this,(e=Object(d.a)(t)).call.apply(e,[this].concat(r)))).state={data:{type:"loading"},selectedCinemas:localStorage.getItem("selected-cinemas")?JSON.parse(localStorage.getItem("selected-cinemas")):[]},n.handleCinemaSelectChange=function(e){var t=Array.from(e.currentTarget.options).filter((function(e){return e.selected})).map((function(e){return e.value}));localStorage.setItem("selected-cinemas",JSON.stringify(t)),n.setState({selectedCinemas:t})},n}return Object(p.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){var e=this;if("loading"===this.state.data.type)return"Loading\u2026";if("error"===this.state.data.type)return"Error!";var t=new Date,n=new Date;n.setHours(23,59,59,999);var a=this.state.data.data.movies.map((function(a){var r=[],i=!0,c=!1,l=void 0;try{for(var s,o=e.state.selectedCinemas[Symbol.iterator]();!(i=(s=o.next()).done);i=!0){var u=s.value;if(a.screenings[u]){var m=!0,d=!1,p=void 0;try{for(var f,h=a.screenings[u].filter((function(e){return e>t&&e<n}))[Symbol.iterator]();!(m=(f=h.next()).done);m=!0){var v=f.value;r.push({cinema:u,screening:v})}}catch(g){d=!0,p=g}finally{try{m||null==h.return||h.return()}finally{if(d)throw p}}}}}catch(g){c=!0,l=g}finally{try{i||null==o.return||o.return()}finally{if(c)throw l}}return 0===r.length?null:{movie:a,screenings:r}})).filter((function(e){return null!==e}));return r.a.createElement("div",null,r.a.createElement("h1",null,"Prague Cinema Tonight"),r.a.createElement("p",null,"Built by",r.a.createElement("img",{alt:"",src:"https://hubelbauer.net/favicon.ico"}),r.a.createElement("a",{href:"https://hubelbauer.net",target:"_blank",rel:"noopener noreferrer"},"Tomas Hubelbauer"),".",r.a.createElement("a",{href:"https://github.com/TomasHubelbauer/puppeteer-csfd-scraper",target:"_blank",rel:"noopener noreferrer"},"GitHub")),r.a.createElement("p",null,this.state.selectedCinemas.length," cinema",this.state.selectedCinemas.length>1?"s":""," selected"),r.a.createElement("select",{multiple:!0,onChange:this.handleCinemaSelectChange,value:this.state.selectedCinemas},this.state.data.data.cinemas.map((function(e){return r.a.createElement("option",{key:e},e)}))),r.a.createElement("p",null,a.length," movies tonight: (last updated\xa0",r.a.createElement(h.a,{date:this.state.data.data.dateAndTime}),")"),r.a.createElement("ul",null,a.map((function(e){return r.a.createElement("li",{key:e.movie.id},r.a.createElement("a",{href:"#"+e.movie.id},e.movie.name))}))),a.map((function(e){return r.a.createElement("details",{key:e.movie.id,open:!0},r.a.createElement("summary",null,r.a.createElement("h2",{id:e.movie.id},e.movie.name)),r.a.createElement("img",{alt:"".concat(e.movie.name," poster"),src:e.movie.posterUrl}),r.a.createElement("p",null,e.movie.content),r.a.createElement("ul",null,e.screenings.map((function(e,t){return r.a.createElement("li",{key:t},e.cinema," ",e.screening.toLocaleTimeString())}))))})))}},{key:"componentDidMount",value:function(){var e=Object(s.a)(l.a.mark((function e(){var t,n,a,r,i,c,s,o,u,m,d,p,f,h;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("data.json");case 2:return t=e.sent,e.next=5,t.json();case 5:(n=e.sent).dateAndTime=new Date(n.dateAndTime),a=!0,r=!1,i=void 0,e.prev=10,c=n.movies[Symbol.iterator]();case 12:if(a=(s=c.next()).done){e.next=36;break}for(o=s.value,u=!0,m=!1,d=void 0,e.prev=17,p=n.cinemas[Symbol.iterator]();!(u=(f=p.next()).done);u=!0)h=f.value,o.screenings[h]&&(o.screenings[h]=o.screenings[h].map((function(e){return new Date(e)})));e.next=25;break;case 21:e.prev=21,e.t0=e.catch(17),m=!0,d=e.t0;case 25:e.prev=25,e.prev=26,u||null==p.return||p.return();case 28:if(e.prev=28,!m){e.next=31;break}throw d;case 31:return e.finish(28);case 32:return e.finish(25);case 33:a=!0,e.next=12;break;case 36:e.next=42;break;case 38:e.prev=38,e.t1=e.catch(10),r=!0,i=e.t1;case 42:e.prev=42,e.prev=43,a||null==c.return||c.return();case 45:if(e.prev=45,!r){e.next=48;break}throw i;case 48:return e.finish(45);case 49:return e.finish(42);case 50:this.setState({data:{type:"success",data:n}});case 51:case"end":return e.stop()}}),e,this,[[10,38,42,50],[17,21,25,33],[26,,28,32],[43,,45,49]])})));return function(){return e.apply(this,arguments)}}()}]),t}(a.Component);Object(i.render)(r.a.createElement(v,null),document.getElementById("root"))}},[[11,1,2]]]);
//# sourceMappingURL=main.78bead8f.chunk.js.map