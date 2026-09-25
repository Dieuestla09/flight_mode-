function toggleFaq(btn){
  const item = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el=>el.classList.remove('open'));
  if(!wasOpen) item.classList.add('open');
}

const AIRLINES = {
  "RwandAir":"#0B2545","Kenya Airways":"#B3273E","Ethiopian Airlines":"#2E7D32","Uganda Airlines":"#1A3F6E"
};
function initials(n){return n.split(" ").map(w=>w[0]).join("").slice(0,2);}

function setTrip(btn, type){
  document.querySelectorAll('.trip-toggle button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('retField').style.display = (type==='one') ? 'none' : 'block';
}

let FLIGHTS = [];
function genFlights(){
  const names = Object.keys(AIRLINES);
  const list = [];
  for(let i=0;i<7;i++){
    const airline = names[i % names.length];
    const stops = i % 3 === 0 ? 0 : (i % 3);
    const depH = 6 + (i*2)%16;
    const durH = 1 + (i%4);
    const price = 180 + i*37 + (stops*20);
    list.push({
      airline, stops, price,
      dep: String(depH).padStart(2,'0')+":00",
      arr: String((depH+durH)%24).padStart(2,'0')+":00",
      duration: durH+"h "+((i*15)%60)+"m",
      durMinutes: durH*60 + (i*15)%60
    });
  }
  return list;
}

function runSearch(){
  const from = document.getElementById('fromCity').value || "Kigali (KGL)";
  const to = document.getElementById('toCity').value || "Nairobi (NBO)";
  document.getElementById('rFrom').textContent = from;
  document.getElementById('rTo').textContent = to;
  FLIGHTS = genFlights();
  document.getElementById('resultsSection').classList.remove('hidden');
  document.getElementById('emptySection').classList.add('hidden');
  renderResults();
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth'});
}

function renderResults(){
  let list = [...FLIGHTS];
  const af = document.getElementById('airlineFilter').value;
  const sf = document.getElementById('stopsFilter').value;
  const sort = document.getElementById('sortSel').value;
  if(af) list = list.filter(f=>f.airline===af);
  if(sf!=="") list = list.filter(f=>f.stops<=parseInt(sf));
  list.sort((a,b)=> sort==='price' ? a.price-b.price : a.durMinutes-b.durMinutes);

  const el = document.getElementById('resultsList');
  el.innerHTML = list.map((f)=>`
    <div class="flight">
      <div class="airline-badge" style="background:${AIRLINES[f.airline]}">${initials(f.airline)}</div>
      <div>
        <div class="route">${f.airline} · ${f.dep} → ${f.arr}</div>
        <div class="meta">${f.duration} · <span class="stops-tag">${f.stops===0?'Nonstop':f.stops+' stop'}</span></div>
      </div>
      <div class="price">$${f.price}</div>
      <button class="btn" onclick='openBooking(${JSON.stringify(f)})'>Select</button>
    </div>
  `).join("") || "<p>No flights match those filters.</p>";
}

function openBooking(f){
  document.getElementById('modalRoot').innerHTML = `
  <div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <button class="close-x" onclick="closeModal()">×</button>
      <h3>${f.airline} — ${f.dep} to ${f.arr}</h3>
      <p class="meta">${f.duration} · ${f.stops===0?'Nonstop':f.stops+' stop'} · Base fare $${f.price}</p>
      <div class="row2">
        <div class="field"><label>Full name</label><input id="pName" placeholder="As on passport"></div>
        <div class="field"><label>Passport / ID No.</label><input id="pDoc"></div>
      </div>
      <div class="row2" style="margin-top:8px;">
        <div class="field"><label>Phone</label><input id="pPhone" placeholder="+250..."></div>
        <div class="field"><label>Email</label><input id="pEmail" placeholder="you@example.com"></div>
      </div>
      <div class="addon"><span>Extra checked baggage (+$25)</span><input type="checkbox" id="addBag" onchange="updateTotal(${f.price})"></div>
      <div class="addon"><span>Seat selection (+$15)</span><input type="checkbox" id="addSeat" onchange="updateTotal(${f.price})"></div>
      <div class="addon"><span>Travel insurance (+$12)</span><input type="checkbox" id="addIns" onchange="updateTotal(${f.price})"></div>
      <div class="total-line"><span>Total</span><span id="totalAmt">$${f.price}</span></div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn" style="flex:1;" onclick='confirmBooking(${JSON.stringify(f)})'>Confirm & pay</button>
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  </div>`;
}
function updateTotal(base){
  let t = base;
  if(document.getElementById('addBag').checked) t+=25;
  if(document.getElementById('addSeat').checked) t+=15;
  if(document.getElementById('addIns').checked) t+=12;
  document.getElementById('totalAmt').textContent = "$"+t;
}
function closeModal(){ document.getElementById('modalRoot').innerHTML=""; }

function confirmBooking(f){
  const name = document.getElementById('pName').value.trim();
  if(!name){ alert("Please enter the passenger's full name."); return; }
  const ref = "FM" + Math.random().toString(36).slice(2,8).toUpperCase();
  const total = document.getElementById('totalAmt').textContent;
  document.getElementById('modalRoot').innerHTML = `
  <div class="overlay"><div class="modal" style="max-width:480px;text-align:center;">
    <div class="eticket">
      <p style="color:var(--sub);margin:0;">Booking confirmed</p>
      <div class="ref">${ref}</div>
      <p style="margin:16px 0 4px;"><strong>${name}</strong></p>
      <p class="meta">${f.airline} · ${f.dep} → ${f.arr} · ${f.duration}</p>
      <p class="meta">Total paid: <strong>${total}</strong></p>
      <p class="meta" style="margin-top:16px;">A copy of this e-ticket has been sent to your email. For changes, contact us on WhatsApp +250 780 544 199.</p>
    </div>
    <button class="btn" style="margin-top:18px;" onclick="closeModal()">Done</button>
  </div></div>`;
}
