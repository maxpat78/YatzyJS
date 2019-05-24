//~ Copyright (C)2011-2019, by maxpat78
//~ Licensed according to Creative Commons CC0 1.0 Universal
//~ This free software lets you play Yatzy dice game in a browser

// Enumerazione delle combinazioni valide
const Punti = {
    Uno:0, Due:1, Tre:2, Quattro:3, Cinque:4, Sei:5,
    Coppia:6, Coppie:7, Tris:8, Poker:9, Scala15:10,
    Scala26:11, Full:12, Chance:13, Yatzy:14
}

// Le seguenti funzioni elaborano un array di 6 elementi, in cui ogni indice
// rappresenta un dado e il valore la sua frequenza 
function sommaDadi(dadi) {
    var somma = 0
    for (i = 0; i < 6; i++)
        somma += dadi[i] * (i + 1)
    return somma
}

// n � il numero di dadi da trovare
function trovaMultipli(dadi, n) {
    var multipli = new Array(3).fill(0)
    var j = 0
    for (i = dadi.length - 1; i >= 0; i--)
        if (dadi[i] >= n)
            multipli[j++] = i+1 // multiplo pi� alto

    return multipli
}

// La scala di 5 dadi pu� essere 1-5 o 2-6
function trovaScala(dadi)
{
    for (i = 1; i < dadi.length-1; i++)
        if (dadi[i] == 0) // no seq. comune 2-3-4-5
            return 0
    if (dadi[0] == 1)
        return 5 // scala al 5
    if (dadi[5] == 1)
        return 6 // scala al 6
    return 0
}

// La seguente riceve un semplice array dei dadi usciti
// e uno di risultati da riempire
function calcolaPuntiMano(dadi, puntiMano) {
  var dadiPerValore = new Array(6).fill(0)

  for (i = 0; i < dadi.length; i++)
      dadiPerValore[dadi[i] - 1]++

  // Assi
  puntiMano[Punti.Uno] = dadiPerValore[0];
  // Due
  puntiMano[Punti.Due] = dadiPerValore[1] * 2
  // Tre
  puntiMano[Punti.Tre] = dadiPerValore[2] * 3
  // Quattro
  puntiMano[Punti.Quattro] = dadiPerValore[3] * 4
  // Cinque
  puntiMano[Punti.Cinque] = dadiPerValore[4] * 5
  // Sei
  puntiMano[Punti.Sei] = dadiPerValore[5] * 6
  // Coppia
  puntiMano[Punti.Coppia] = trovaMultipli(dadiPerValore, 2)[0] * 2
  // Doppia coppia
  var Coppie = trovaMultipli(dadiPerValore, 2)
  puntiMano[Punti.Coppie] = (Coppie[1] > 0) ? Coppie[0] * 2 + Coppie[1] * 2 : 0
  // Tris
  puntiMano[Punti.Tris] = trovaMultipli(dadiPerValore, 3)[0] * 3
  // Poker
  puntiMano[Punti.Poker] = trovaMultipli(dadiPerValore, 4)[0] * 4
  // Scala al 5
  puntiMano[Punti.Scala15] = (trovaScala(dadiPerValore) == 5) ? 15 : 0
  // Scala al 6
  puntiMano[Punti.Scala26] = (trovaScala(dadiPerValore) == 6) ? 20 : 0
  // Full
  var Tris, Coppia
  Tris = trovaMultipli(dadiPerValore, 3)[0] // il Tris � anche una 2a Coppia!
  Coppia = (Tris == Coppie[0]) ? Coppie[1] : Coppie[0]
  puntiMano[Punti.Full] = (Tris > 0 && Coppia > 0) ? sommaDadi(dadiPerValore) : 0
  // Chance
  puntiMano[Punti.Chance] = sommaDadi(dadiPerValore)
  // Yatzy
  puntiMano[Punti.Yatzy] = (trovaMultipli(dadiPerValore, 5)[0] > 0) ? 50 : 0
}


D6.creaDadi = function(callback, callbackData) {
	buttonLabel = "Lancia!"
	D6.numDice = 5
	D6.numDiceShown = 5
	var results = new Array()
	var i
	for (i=0; i<5; ++i) {
		results[i] = 0
	}
	var builder = new D6AnimBuilder("dice", results, null, D6.baseUrl, 5, 50, true)
	D6.builder = builder
	D6AnimBuilder.onClick = function(id) {D6.diceSave(id)}
	var layout = [1]
	if (!callback) callback= D6Sample.noop
	if (!callbackData) callbackData = null
	var middleManData = {
		"id" : "dice",
		"callback" : callback,
		"callbackData" : callbackData
	}
	var genHtml = "<div id='diceall' style='position:relative; top: -425px; left: 270px;'>" + builder.genDiceHtml(layout, D6.middleManCallback, middleManData) + builder.genSDiceHtml(layout)
	if (buttonLabel != "none") {
		genHtml += "<div id='diceform'><form><input style='width:60px' type='button' id='dicebutton' value='" + buttonLabel +
    "' onclick='tiraDadi()'/> <button style='width:60px' onclick='resetGioco()' align='right'>Azzera</button></form></div>"
	}
	genHtml += "</div>"
	D6.genHtml = genHtml
	document.write(genHtml)
}


function tiraDadi() {
    if (tiriRimasti == 0 || turniRimasti == 0) return
    dice = D6AnimBuilder.get("dice")
    dice.reset()
    dice.start()
    tiriRimasti--
    //~ document.getElementById("tiri").innerHTML = tiriRimasti
}


// Annota il punteggio scelto e prepara una nuova mano
function annota(id) {
    // Verifica che la combinazione non sia gi� assegnata
    if (puntiSalvati[id] != undefined) return
    // Verifica che sia appena stato eseguito un tiro
    if (! puntoDaAnnotare) return
    puntiSalvati[id] = puntiMano[id]
    tiriRimasti = 3
    turniRimasti--
    dadiSalvati = new Array(D6.numDice)
    D6.diceToShow(5)
    for (i=1; i<D6.numDice+1; i++)
        document.getElementById('sdice'+i).src="blank.gif"
    // Resetta le caselle non annotate
    for (var p in Punti) {
        e = document.getElementById(p)
        if (puntiSalvati[Punti[p]] == undefined)
            e.innerHTML = ""
        else {
            e.style.color = "initial"
            e.style.fontWeight = "initial"
        }
    }
    // Somma i punti della sezione superiore
    var somma=0;
    for (i=0; i < 6; i++)
        somma += (puntiSalvati[i]==undefined? 0:puntiSalvati[i])
    document.getElementById("Subtotale").innerHTML = somma

    // Assegna il bonus per la sezione superiore
    if (somma > 62) {
        somma += 50
        document.getElementById("Bonus").innerHTML = 50
    }

    // Calcola il punteggio finale, sommando la sezione inferiore
    if (turniRimasti == 0) {
        for (i=6; i<15; i++)
            somma += puntiSalvati[i]
        document.getElementById("Totale").innerHTML = somma
        storeScore(somma)
    }
    //~ document.getElementById("turni").innerHTML = turniRimasti
    //~ document.getElementById("tiri").innerHTML = 3
    puntoDaAnnotare = false
}


// Modifica una casella di punteggio al passaggio del mouse
function onMouse(id, action) {
    for (p in Punti)
        if (Punti[p] == id) {
            e = document.getElementById(p)
            break
        }
    if (action == 1)
        e.style.backgroundColor = "yellow"
    else
        e.style.backgroundColor = "initial"
}


// Aggiorna le informazioni dopo il tiro
var callback = function (total, info, results) {
    D6.diceGet(dadiSalvati)
    puntiMano = new Array(15).fill(0)
    calcolaPuntiMano(dadiSalvati, puntiMano)
    for (var p in Punti) {
        if (puntiSalvati[Punti[p]] == undefined) {
            e = document.getElementById(p)
            e.innerHTML = puntiMano[Punti[p]]
            e.style.color = "green"
            e.style.fontWeight = "bold"
        }
    }
    puntoDaAnnotare = true
}

var puntiSalvati, puntiMano, dadiSalvati, tiriRimasti, turniRimasti, puntoDaAnnotare

function resetGioco() {
    D6.diceToShow(5)
    puntiSalvati = new Array(15)
    dadiSalvati = new Array(D6.numDice)
    tiriRimasti = 3
    turniRimasti = 15
    puntoDaAnnotare = false
    //~ document.getElementById("tiri").innerHTML = tiriRimasti
    //~ document.getElementById("turni").innerHTML = turniRimasti
    for (var p in Punti) {
        e = document.getElementById(p)
        e.innerHTML = ""
    }
}


function hallOfFame() {
    document.write('<html><body>')
    document.write('<div style="text-align:center"><a href="javascript:history.back()">(Torna al gioco)</a></div>')
    document.write('<h2>Ultimi 100 punteggi</h2>')
    document.write('<table>')
    var punteggi = getScore()
    for (var k in punteggi) {
        document.write('<tr><td>'+k+'</td><td style=""></td><td>'+punteggi[k]+'</td></tr>')
    }
    document.write('</table>')
    document.write('</body></html>')
}


function getScore() {
    var cookie = document.cookie.split(';')
    var myCookie="", label='punteggi='
    var punteggi = {}

    for(i=0; i<cookie.length; i++)
    {
        var t = cookie[i].trim()
        if (t.indexOf(label)==0)
            myCookie = t.substring(label.length, t.length)
    }

    if (myCookie)
        punteggi = JSON.parse(myCookie)

    return punteggi
}


// Salva cronologicamente gli ultimi 100 punteggi
function storeScore(score) {
    var punteggi = getScore()
    if (Object.keys(punteggi).length == 100) {
        delete punteggi[Object.keys(punteggi)[0]]
    }
    if (! punteggi)
        punteggi = {}
    punteggi[new Date().toLocaleString()] = score
    setCookie('punteggi', JSON.stringify(punteggi), 365)
}


function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
