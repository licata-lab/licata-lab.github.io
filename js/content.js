/* =========================================================
   CONTENT — edit here.
   Each section = one main node, one menu item, one page.
   "kids" are its first neighbours (shown on hover), and kids can have kids.
   A node with "href" is a link (mailto:, tel:, https://…) instead of opening the page.
   The order of SECTIONS = position on screen: left column top→bottom, then right column bottom→top.
   ========================================================= */
const SECTIONS = [
    { id:"research", label:"Research", color:"--c1",
    lead:"How networks of molecular interactions explain health and disease.",
    kids:[
      {label:"Interactome", kids:[{label:"Manual curation"},{label:"IMEx standards"}]},
      {label:"Networks", kids:[{label:"Network propagation"},{label:"Multilayer networks"},{label:"Community detection"}]},
      {label:"Neurodevelopment", kids:[{label:"Autism spectrum disorder"},{label:"Rare neurodevelopmental disorders"}]},
      {label:"Inflammation to cancer", kids:[{label:"Inflammatory bowel disease"},{label:"Colorectal cancer"},{label:"Colitis-associated cancer"}]}
    ], html:`
    <h3>The human interactome</h3>
    <p>We manually curate molecular interactions from the scientific literature, following the standards of the IMEx Consortium, and make them freely available through MINT, for physical interactions between proteins, and SIGNOR, for causal relationships in cell signalling. Every record captures not only which molecules interact, but how: the experimental evidence, the regions involved in binding and the effect of mutations on the interaction.</p>
    <p>On top of this curated knowledge we build new resources, such as the IMEx binding domain dataset, which maps experimentally defined binding regions onto protein domains and disease variants across seven species (<a href="https://doi.org/10.64898/2026.10.15.759378" rel="noopener">preprint on bioRxiv</a>).</p>
    <h3>Network biology</h3>
    <p>We turn interaction data into networks and use them as a map to read genetic and molecular data. Multilayer networks combine protein interactions, gene co-expression and functional annotation in a single model; network propagation spreads a signal, such as the genes mutated in a patient, across this map to find the modules it perturbs; community detection identifies groups of genes or diseases that converge on the same biological processes.</p>
    <h3>Neurodevelopmental disorders</h3>
    <p>Neurodevelopmental disorders, from autism spectrum disorder to rare genetic syndromes, are caused by variants in hundreds of different genes, yet patients often share similar clinical features. We use multilayer networks to understand how this genetic heterogeneity converges on a smaller number of biological processes, to prioritise new candidate genes and to group disorders that share the same underlying mechanisms.</p>
    <h3>From inflammation to cancer</h3>
    <p>Chronic inflammation of the gut increases the risk of colorectal cancer. Using gene expression data from patients and network approaches, we study how molecular programmes and cell populations change along the path from inflammation to tumour, to identify what the two conditions share and where they diverge.</p>`},
  { id:"people", label:"People", color:"--c2",
    lead:"The researchers, students and collaborators behind the group.",
    kids:[
      {label:"PI", kids:[{label:"Luana Licata"}]},
      {label:"Bio-curator", kids:[{label:"Marta Iannuccelli"}]},
      {label:"Researcher", kids:[{label:"Pia Francesca Nuzzarello"}]},
      {label:"PhD students", kids:[{label:"Alessia Pinto"}]},
      {label:"Students", kids:[{label:"Adja Khady Ndoye"},{label:"Parnian Omidi"}]},
    ], html:`
        <div class="person"><div class="av">LL</div><div><b>Luana Licata</b><span>Principal Investigator</span></div></div>
    <div class="person"><div class="av">MI</div><div><b>Marta Iannuccelli</b><span>Biocurator</span></div></div>
    <div class="person"><div class="av">PN</div><div><b>Pia Francesca Nuzzarello</b><span>Researcher</span></div></div>
    <div class="person"><div class="av">AP</div><div><b>Alessia Pinto</b><span>PhD student</span></div></div>
    <div class="person"><div class="av">AN</div><div><b>Adja Khady Ndoye</b><span>Master's student</span></div></div>
    <div class="person"><div class="av">PO</div><div><b>Parnian Omidi</b><span>Master's student</span></div></div>
    <h3>Join us</h3>
    <p>We welcome master's students interested in systems biology. Get in touch through the Contact page.</p>`},
    { id:"publications", label:"Publications", color:"--c3",
    lead:"Selected recent papers from the group.",
    kids:[
      {label:"Latest papers"},
      {label:"Google Scholar", href:"https://scholar.google.com/citations?user=_AvozfEAAAAJ"},
      {label:"PubMed", href:"https://pubmed.ncbi.nlm.nih.gov/?term=Licata%20Luana%5BFull%20Author%20Name%5D&sort=date"}
    ], html:`
    <p>The full list is on
      <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Licata%20Luana%5BFull%20Author%20Name%5D&sort=date" rel="noopener">PubMed</a>,
      <a href="https://scholar.google.com/citations?user=_AvozfEAAAAJ&hl=en" rel="noopener">Google Scholar</a> and
      <a href="https://orcid.org/0000-0001-5084-9000" rel="noopener">ORCID</a>.</p>

    <h3>2026</h3>
    <div class="pub"><b>Pinto A</b>, Lo Surdo P, Medina Reyes JJ, Bergogne L, Padilla Franzotti C, <b>Iannuccelli M</b>, Panni S, Panneerselvam K, Ricard-Blum S, Ragueneau E, Orchard S, Hermjakob H, Zanzoni A, <b>Licata L</b>. Capturing domain-level detail of molecular interactions in the IMEx Consortium binding domain data set. <em>bioRxiv</em> (2026). <a href="https://doi.org/10.64898/2026.10.15.759378" rel="noopener">doi:10.64898/2026.10.15.759378</a></div>    <div class="pub">Lo Surdo P, <b>Iannuccelli M</b>, Karis K, Meo E, <b>Omidi P</b>, Tosoni M, Graziosi S, Panni S, Fiorillo MT, <b>Licata L</b>, Sacco F, Gyori BM, Perfetto L. SIGNOR 4.0: the 2025 update with focus on phosphorylation data. <em>Nucleic Acids Res</em> 54(D1):D682–D690 (2026). <a href="https://doi.org/10.1093/nar/gkaf1237" rel="noopener">doi:10.1093/nar/gkaf1237</a></div>
    <h3>2025</h3>
    <div class="pub">Laman Trip DS, van Oostrum M, Memon D, … <b>Licata L</b>, … Beltrao P. A tissue-specific atlas of protein–protein associations enables prioritization of candidate disease genes. <em>Nat Biotechnol</em> 44(4):654–667 (2026). <a href="https://doi.org/10.1038/s41587-025-02659-z" rel="noopener">doi:10.1038/s41587-025-02659-z</a></div>`},
  { id:"contact", label:"Contact", color:"--c6",
    lead:"Department of Biology, University of Rome Tor Vergata.",
    kids:[
      {label:"PI", kids:[{label:"luana.licata@uniroma2.it", href:"mailto:luana.licata@uniroma2.it"}]},
      {label:"Lab members", kids:[{label:"alessia.pinto@uniroma2.it", href:"mailto:alessia.pinto@uniroma2.it"},{label:"pia.nuzzariello@uniroma2.it", href:"mailto:pia.nuzzariello@uniroma2.it"}]},
    ], html:`
    <h3>Address</h3>
    <p>Via della Ricerca Scientifica 1<br>00133 Rome, Italy</p>
    <h3>Principal Investigator</h3>
    <p><a href="mailto:luana.licata@uniroma2.it"><span>luana.licata@uniroma2.it</span></a><br></p>
    <h3>Finding us</h3>
    <p>SOGENE building, basement level<br>Corridor H, Lab 316</p>`},
    { id:"news", label:"News", color:"--c5",
    lead:"Papers, talks and life in the lab.",
    kids:[
      {label:"New preprint", href:"https://doi.org/10.64898/2026.10.15.759378"},
      {label:"HUPO-PSI 2026", href:"https://www.psidev.info/hupo-psi-meeting-2026"}
    ], html:`
    <h3>October 2026 · New preprint on bioRxiv</h3>
    <p>Our latest work is out on bioRxiv: <a href="https://doi.org/10.64898/2026.10.15.759378" rel="noopener">Capturing domain-level detail of molecular interactions in the IMEx Consortium binding domain data set</a>. We present a dataset that maps experimentally defined binding regions onto protein domains and disease variants, built from the curated interactions of the IMEx Consortium in collaboration with our international partners.</p>

    <h3>May 2026 · HUPO-PSI Spring Meeting in Rome</h3>
    <p>The whole group took part in the <a href="https://www.psidev.info/hupo-psi-meeting-2026" rel="noopener">HUPO-PSI Spring Meeting 2026</a>, organised in Rome by Luana Licata together with ELIXIR-Italy. Four days at the CNR with the Proteomics Standards Initiative community, working on shared data standards for proteomics and molecular interactions.</p>`},
  { id:"resources", label:"Resources", color:"--c4",
    lead:"Databases and tools we build and maintain, free for the community.",
    kids:[
      {label:"MINT", kids:[{label:"Open MINT", href:"https://mint.bio.uniroma2.it"}]},
      {label:"SIGNOR", kids:[{label:"Open SIGNOR", href:"https://signor.uniroma2.it"}]},
      {label:"GitHub",kids:[{label:"Open GitHub", href:"https://github.com/licata-lab"}]}
    ], html:`
    <h3>MINT</h3>
    <p>A database of molecular interactions manually curated from the literature. <a href="https://mint.bio.uniroma2.it" rel="noopener">mint.bio.uniroma2.it</a></p>
    <h3>SIGNOR</h3>
    <p>A network of causal signalling relationships between biological entities. <a href="https://signor.uniroma2.it" rel="noopener">signor.uniroma2.it</a></p>
    <h3>Code</h3>
    <p>Pipelines and scripts on our <a href="https://github.com/licata-lab" rel="noopener">GitHub</a>.</p>`}
];
