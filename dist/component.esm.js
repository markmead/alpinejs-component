function m(t){class r extends HTMLElement{connectedCallback(){let n=this.attachShadow({mode:"open"}),s=this.hasAttribute(":template"),c=this.hasAttribute(":url");(s||c)&&t.initTree(this);let{template:a,url:i}=this.attributes;a&&function(e){let p=document.getElementById(e),l=new DOMParser().parseFromString(p.innerHTML,"text/html").body.firstChild;return Promise.resolve(l)}(a.value).then(e=>{n.appendChild(e),t.initTree(n)}),i&&fetch(i.value).then(o=>o.text()).then(o=>{let e=new DOMParser().parseFromString(o,"text/html").body.firstChild;n.appendChild(e),t.initTree(n)})}}window.customElements.get("x-component-wrapper")||(customElements.define("x-component-wrapper",r),t.directive("component",()=>new r))}var f=m;export{f as default};
