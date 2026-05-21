export const cases = [
  {
    id: 'case-01',
    label: 'Case #1',
    imageUrl: '/cases/case-01-xray.jpeg',
    overlayUrl: '/cases/case-01-expert.png',
    notes: '',
    bodyRegion: 'Pelvis',
    view: 'AP',
    aspectRatio: '4 / 3',
    demographics: '78 F',
    indication: 'Motorcycle accident',
    findings: [
      'Left total hip arthroplasty is present.',
      'Prominent periprosthetic radiolucency surrounds the acetabular component, most conspicuous along the superior acetabular interface.',
      'Additional periprosthetic lucency is present along the femoral stem, including the proximal and distal femoral stem interfaces.',
      'Areas of periprosthetic osteolysis/cortical thinning are present adjacent to the femoral component.',
      'No acute periprosthetic fracture or frank prosthetic dislocation is identified on these views.',
      'Mild degenerative change of the contralateral native hip.'
    ],
    impression: [
      'Left total hip arthroplasty with acetabular and femoral periprosthetic lucency/osteolysis, most consistent with chronic aseptic prosthetic loosening.',
      'No acute fracture or dislocation.'
    ],
    discussion: [
      'Aseptic loosening is one of the most common long-term complications of total hip arthroplasty.',
      'Radiographic clues include progressive radiolucent lines, periprosthetic osteolysis, component migration, subsidence, or change in cup orientation.',
      'The acetabular component should be assessed for circumferential lucency, superior migration, cup tilt, and surrounding osteolysis.',
      'The femoral component should be evaluated for lucency along the stem, distal pedestal formation, subsidence, cortical thinning, and endosteal scalloping.',
      'Aseptic loosening is commonly related to wear-debris particle disease, which produces macrophage-mediated osteolysis.',
      'Infection can mimic aseptic loosening radiographically; clinical history, ESR/CRP, aspiration, and cultures are needed when infection is a concern.',
      'Comparison with prior radiographs is critical because progression over time strongly supports loosening.'
    ]
  },
  {
    id: 'case-02',
    label: 'Case #2',
    imageUrl: '/cases/case-02-xray.JPG',
    overlayUrl: '/cases/case-02-expert.jpeg',
    notes: '',
    bodyRegion: 'Pelvis',
    view: 'AP',
    aspectRatio: '4 / 3',
    demographics: '64 M',
    indication: 'To be determined',
    findings: [
      'Right total hip arthroplasty is present.',
      'Periacetabular radiolucency is present along the acetabular component interface, most evident superiorly.',
      'Periprosthetic lucency is present along the femoral stem, particularly along the distal femoral component interface.',
      'There is chronic periprosthetic remodeling/osteolysis adjacent to the femoral stem.',
      'Heterotopic ossification or chronic dystrophic ossification is present adjacent to the greater trochanter.',
      'No acute periprosthetic fracture or hip dislocation is identified.',
      'The contralateral native hip demonstrates mild degenerative change.'
    ],
    impression: [
      'Right total hip arthroplasty with acetabular and femoral periprosthetic lucency, consistent with chronic aseptic loosening.',
      'Chronic periprosthetic osteolysis/remodeling adjacent to the femoral stem.',
      'No acute fracture or dislocation.'
    ],
    discussion: [
      'Total hip arthroplasty loosening may involve the acetabular component, femoral component, or both.',
      'Acetabular loosening is suggested by progressive radiolucency around the cup, cup migration, cup tilt, broken screws, or acetabular osteolysis.',
      'Femoral stem loosening is suggested by progressive lucency around the stem, subsidence, pedestal formation, cortical thinning, and distal stem migration.',
      'Aseptic loosening is often caused by polyethylene or metal wear debris, leading to inflammatory osteolysis.',
      'Heterotopic ossification near the greater trochanter is a common chronic postoperative finding and should be separated from signs of loosening.',
      'Radiographs should be compared with prior postoperative studies because stable nonprogressive lucencies can be less concerning than progressive lucencies.',
      'If the patient has pain, fever, elevated inflammatory markers, or early postoperative symptoms, periprosthetic joint infection should be excluded.'
    ]
  },
  {
    id: 'case-03',
    label: 'Case #3',
    images: [
      '/cases/case-03-view-1.png',
      '/cases/case-03-view-2.png',
      '/cases/case-03-view-3.png'
    ],
    // no overlay for case-03
    notes: '',
    bodyRegion: 'Pelvis',
    view: 'AP/Oblique',
    aspectRatio: '4 / 3',
    demographics: '81 F',
    indication: '',
    findings: [
      'Total knee arthroplasty is present.',
      'The femoral and tibial components are grossly aligned on the provided lateral view.',
      'No acute periprosthetic fracture or frank prosthetic dislocation is identified.',
      'Multiple rounded ossified bodies project posterior to the knee joint in the popliteal/posterior capsular region.',
      'No definite component loosening is visible on this isolated lateral radiograph.',
      'Evaluation is limited without AP, sunrise/Merchant, and comparison views.'
    ],
    impression: [
      'Total knee arthroplasty without acute periprosthetic fracture or dislocation on the provided lateral view.',
      'Posterior periarticular ossified bodies, favored heterotopic ossification versus ossified intra-articular loose bodies.',
      'No definite radiographic evidence of prosthetic loosening on this single view.'
    ],
    discussion: [
      'Posterior ossified bodies after total knee arthroplasty may represent heterotopic ossification, chronic loose bodies, or ossification within a posterior recess or Baker cyst.',
      'These findings may be asymptomatic, but can contribute to posterior knee pain, stiffness, locking, or reduced range of motion.',
      'TKA loosening is better evaluated on a complete radiographic series, including AP, lateral, and patellofemoral views.',
      'Important signs of TKA loosening include progressive periprosthetic lucency, component migration, tibial tray subsidence, or change in component alignment.',
      'Infection cannot be diagnosed or excluded by radiographs alone; clinical symptoms, ESR/CRP, aspiration, and cultures are needed if infection is suspected.'
    ]
  },
  {
    id: 'case-04',
    label: 'Case #4',
    images: [
      '/cases/case-04-view-1.png',
      '/cases/case-04-view-2.png'
    ],
    // no overlay for case-04
    notes: '',
    bodyRegion: 'Pelvis',
    view: 'AP/Lateral',
    aspectRatio: '4 / 3',
    demographics: '79 M',
    indication: '',
    findings: [
      'Native right knee radiographs demonstrate severe medial tibiofemoral joint-space narrowing, approaching bone-on-bone articulation.',
      'Subchondral sclerosis is present along the medial femoral condyle and medial tibial plateau.',
      'Marginal osteophytes are present along the tibiofemoral and patellofemoral compartments.',
      'Patellofemoral degenerative change is present on the lateral view.',
      'The lateral tibiofemoral compartment is relatively better preserved.',
      'No acute fracture or dislocation is identified.',
      'Peripheral arterial atherosclerotic calcifications are present posteriorly.'
    ],
    impression: [
      'Severe right knee osteoarthrosis, greatest in the medial tibiofemoral compartment.',
      'Mild-to-moderate patellofemoral degenerative change.',
      'No acute osseous abnormality.',
      'Peripheral arterial atherosclerotic calcifications.'
    ],
    discussion: [
      'Knee osteoarthritis is diagnosed radiographically by joint-space narrowing, osteophyte formation, subchondral sclerosis, and subchondral cystic change.',
      'Medial compartment predominant osteoarthritis is common because the medial compartment bears a large proportion of load during gait.',
      'Severe narrowing with near bone-on-bone articulation corresponds to advanced osteoarthritis, often Kellgren-Lawrence grade 4 if formally graded.',
      'Patellofemoral osteoarthritis should be assessed on lateral and sunrise/Merchant views.',
      'Peripheral arterial calcifications are a common incidental finding in older patients and may reflect systemic atherosclerotic disease.',
      'Radiographic severity should be correlated with symptoms, functional limitation, and response to conservative therapy.'
    ]
  },
  {
    id: 'case-05',
    label: 'Case #5',
    images: [
      '/cases/case-05-view-1.png',
      '/cases/case-05-view-2.png',
      '/cases/case-05-view-3.png'
    ],
    // no overlay for case-05
    notes: '',
    bodyRegion: 'Pelvis',
    view: 'AP/Oblique',
    aspectRatio: '4 / 3',
    demographics: '35 F',
    indication: '',
    findings: [
      'Bilateral native knee radiographs are provided.',
      'Mild medial tibiofemoral joint-space narrowing is present bilaterally.',
      'The lateral tibiofemoral compartments are relatively preserved.',
      'Minimal marginal osteophytic degenerative change is present.',
      'Sunrise/Merchant view demonstrates mild patellofemoral degenerative change and possible mild lateral patellar tilt.',
      'No acute fracture or dislocation is identified.',
      'No sizable knee joint effusion is evident on the lateral view.'
    ],
    impression: [
      'Mild bilateral medial tibiofemoral compartment osteoarthrosis.',
      'Mild patellofemoral degenerative change / possible mild lateral patellar tilt.',
      'No acute osseous abnormality.'
    ],
    discussion: [
      'This case demonstrates early/mild knee osteoarthritis rather than advanced bone-on-bone disease.',
      'Weight-bearing views are important because mild tibiofemoral joint-space narrowing may be underestimated on non-weight-bearing radiographs.',
      'Mild medial compartment narrowing can reflect early cartilage loss, meniscal degeneration/extrusion, or early osteoarthrosis.',
      'Patellofemoral alignment should be assessed on sunrise/Merchant views; mild lateral tilt can be associated with anterior knee pain or chondromalacia.',
      'Radiographic findings may be mild even when symptoms are clinically meaningful, so correlation with pain location and exam is important.',
      'Typical initial management is conservative, including activity modification, physical therapy, strengthening, weight management when relevant, and anti-inflammatory strategies when appropriate.'
    ]
  }
];
