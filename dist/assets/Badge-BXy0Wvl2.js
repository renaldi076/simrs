import{l as x,o as y,m as e,e as f,E as j}from"./index-Byj6jgWY.js";import{C as N,X as w}from"./formatters-B9rtxBlF.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=x("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=x("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=x("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);function M({label:l,name:t,type:r="text",placeholder:o,value:s,onChange:n,error:a,helperText:d,required:b=!1,disabled:g=!1,maxLength:c,className:p=""}){const[i,m]=y.useState(!1),u=r==="password"&&i?"text":r,h=typeof s=="string"?s.length:0;return e.jsxs("div",{className:`flex flex-col gap-1 ${p}`,children:[l&&e.jsxs("label",{htmlFor:t,className:"text-sm font-medium text-gray-700",children:[l,b&&e.jsx("span",{className:"text-red-500 ml-0.5",children:"*"})]}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{id:t,name:t,type:u,placeholder:o,value:s,onChange:n,required:b,disabled:g,maxLength:c,"aria-invalid":!!a,"aria-describedby":a?`${t}-error`:d?`${t}-helper`:void 0,className:`
            w-full rounded-lg border px-3 py-2 text-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${a?"border-red-500 focus:border-red-500 focus:ring-red-200":"border-gray-300 focus:border-blue-500 focus:ring-blue-200"}
            ${r==="password"?"pr-10":""}
          `}),r==="password"&&e.jsx("button",{type:"button",onClick:()=>m(!i),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700","aria-label":i?"Hide password":"Show password",children:i?e.jsx(f,{size:18}):e.jsx(j,{size:18})})]}),e.jsxs("div",{className:"flex justify-between",children:[a&&e.jsx("p",{id:`${t}-error`,className:"text-xs text-red-600",role:"alert",children:a}),!a&&d&&e.jsx("p",{id:`${t}-helper`,className:"text-xs text-gray-500",children:d}),c&&e.jsxs("p",{className:"text-xs text-gray-400 ml-auto",children:[h,"/",c]})]})]})}function B({columns:l,data:t,emptyMessage:r="No data available",className:o=""}){return e.jsx("div",{className:`overflow-x-auto rounded-lg border border-gray-200 ${o}`,children:e.jsxs("table",{className:"min-w-full divide-y divide-gray-200",children:[e.jsx("thead",{className:"bg-gray-50",children:e.jsx("tr",{children:l.map(s=>e.jsx("th",{scope:"col",className:"px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500",children:s.label},s.key))})}),e.jsx("tbody",{className:"divide-y divide-gray-200 bg-white",children:t.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:l.length,className:"px-4 py-8 text-center text-sm text-gray-500",children:r})}):t.map((s,n)=>e.jsx("tr",{className:n%2===1?"bg-gray-50":"",children:l.map(a=>e.jsx("td",{className:"px-4 py-3 text-sm text-gray-700",children:a.render?a.render(s):s[a.key]},a.key))},n))})]})})}const $={success:{icon:k,bg:"bg-green-50",border:"border-green-200",text:"text-green-800",iconColor:"text-green-500"},warning:{icon:C,bg:"bg-amber-50",border:"border-amber-200",text:"text-amber-800",iconColor:"text-amber-500"},error:{icon:N,bg:"bg-red-50",border:"border-red-200",text:"text-red-800",iconColor:"text-red-500"},info:{icon:v,bg:"bg-blue-50",border:"border-blue-200",text:"text-blue-800",iconColor:"text-blue-500"}};function S({type:l,message:t,title:r,onClose:o}){const s=$[l],n=s.icon;return e.jsxs("div",{className:`flex items-start gap-3 rounded-lg border p-4 ${s.bg} ${s.border}`,role:"alert",children:[e.jsx(n,{size:20,className:`shrink-0 mt-0.5 ${s.iconColor}`}),e.jsxs("div",{className:`flex-1 ${s.text}`,children:[r&&e.jsx("p",{className:"font-medium",children:r}),e.jsx("p",{className:"text-sm",children:t})]}),o&&e.jsx("button",{onClick:o,className:`shrink-0 ${s.iconColor} hover:opacity-70`,"aria-label":"Close alert",children:e.jsx(w,{size:18})})]})}const z={success:"bg-green-100 text-green-700",warning:"bg-amber-100 text-amber-700",danger:"bg-red-100 text-red-700",info:"bg-blue-100 text-blue-700",neutral:"bg-gray-100 text-gray-700"},A={sm:"px-2 py-0.5 text-xs",md:"px-2.5 py-1 text-sm"};function T({children:l,variant:t="neutral",size:r="md"}){return e.jsx("span",{className:`
        inline-flex items-center rounded-full font-medium
        ${z[t]}
        ${A[r]}
      `,children:l})}export{S as A,T as B,M as I,B as T};
