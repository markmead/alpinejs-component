function o(e){class r extends HTMLElement{connectedCallback(){let n=this.attachShadow({mode:"open"});if((this.hasAttribute(":template")||this.hasAttribute(":url"))&&e.initTree(this),this.attributes.template){let t=document.getElementById(this.attributes.template.value),i=new DOMParser().parseFromString(t.innerHTML,"text/html").body.firstChild;n.appendChild(i),document.addEventListener("alpine:initialized",()=>{e.initTree(n)})}this.attributes.url&&fetch(this.attributes.url.value).then(t=>t.text()).then(t=>{let i=new DOMParser().parseFromString(t,"text/html").body.firstChild;n.appendChild(i),e.initTree(n)})}}window.customElements.get("x-component-wrapper")||(customElements.define("x-component-wrapper",r),e.directive("component",()=>new r))}var p=o;export{p as default};
