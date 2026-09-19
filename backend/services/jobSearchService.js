/**
 * Live Job Recommendation & Search Service
 * Supports RapidAPI/JSearch aggregator and curated high-demand vacancies
 * across Indian tech hubs (Bengaluru, Hyderabad, Pune, Chennai, Delhi-NCR, Mumbai, Remote).
 */

const INDIAN_TECH_HUB_JOBS = [
  // RTL Design Engineering
  {
    id: 'job_rtl_01',
    jobTitle: 'Senior RTL Design Engineer',
    company: 'Qualcomm India',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹22 - 38 LPA',
    experienceRequired: '3-6 years',
    applyUrl: 'https://careers.qualcomm.com/careers?query=RTL%20Design%20Bengaluru',
    naukriUrl: 'https://www.naukri.com/rtl-design-engineer-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=RTL+Design+Engineer+Qualcomm&location=Bengaluru',
    requiredSkills: ['SystemVerilog', 'Verilog', 'RTL Design', 'UVM', 'CDC', 'Static Timing Analysis (STA)', 'AXI Protocols'],
    preferredSkills: ['SpyGlass', 'Formality', 'Synthesis', 'Low Power Design (UPF)'],
    description: 'Lead RTL micro-architecture, IP design, and digital verification for next-generation Snapdragon compute and mobile processors. Collaborate closely with synthesis, DFT, and physical design teams in Qualcomm Bangalore.',
    postedAt: '1 day ago',
    category: 'RTL Design Engineer'
  },
  {
    id: 'job_rtl_02',
    jobTitle: 'RTL / ASIC Design Engineer',
    company: 'NVIDIA',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹26 - 45 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=RTL+Bengaluru',
    naukriUrl: 'https://www.naukri.com/nvidia-rtl-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=NVIDIA+RTL+Design&location=Bengaluru',
    requiredSkills: ['SystemVerilog', 'Verilog', 'Computer Architecture', 'ASIC Flow', 'Timing Closure', 'Python'],
    preferredSkills: ['PCIe Gen5', 'High-Speed Memory Controllers', 'Perl', 'C++'],
    description: 'Design world-class GPU and Tensor Core acceleration sub-modules. Deliver synthesizable RTL, perform functional verification, and resolve complex clock domain crossings in deep-submicron geometries.',
    postedAt: '2 days ago',
    category: 'RTL Design Engineer'
  },
  {
    id: 'job_rtl_03',
    jobTitle: 'Digital RTL Verification & Design Engineer',
    company: 'Texas Instruments',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'On-site',
    salaryRange: '₹18 - 32 LPA',
    experienceRequired: '1-4 years',
    applyUrl: 'https://careers.ti.com/search-jobs/?k=Digital+Design+Bengaluru',
    naukriUrl: 'https://www.naukri.com/texas-instruments-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Texas+Instruments+RTL+Bengaluru',
    requiredSkills: ['Verilog', 'SystemVerilog', 'Digital Design', 'FSM Design', 'ModelSim', 'STA'],
    preferredSkills: ['Analog-Digital Co-simulation', 'I2C', 'SPI', 'MATLAB'],
    description: 'Develop high-performance mixed-signal digital cores for automotive and industrial power management processors at TI India Design Center.',
    postedAt: '3 days ago',
    category: 'RTL Design Engineer'
  },
  {
    id: 'job_rtl_04',
    jobTitle: 'RTL Design & Subsystem Engineer',
    company: 'Intel Corporation',
    location: 'Hyderabad',
    state: 'Telangana',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹24 - 40 LPA',
    experienceRequired: '3-7 years',
    applyUrl: 'https://intel.wd1.myworkdayjobs.com/External?q=RTL+Hyderabad',
    naukriUrl: 'https://www.naukri.com/intel-rtl-jobs-in-hyderabad',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Intel+RTL+Hyderabad',
    requiredSkills: ['SystemVerilog', 'RTL Design', 'SoC Integration', 'AXI / AHB', 'VCS / QuestaSim', 'Logic Equivalence'],
    preferredSkills: ['Formal Verification', 'Python', 'Synopsys Design Compiler'],
    description: 'Participate in the architecture and micro-architecture definition of cutting-edge SoC silicon modules, focusing on interconnects, power management, and clocking.',
    postedAt: 'Just now',
    category: 'RTL Design Engineer'
  },
  {
    id: 'job_rtl_05',
    jobTitle: 'Lead RTL Architecture Specialist',
    company: 'Samsung Semiconductor India Research (SSIR)',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'On-site',
    salaryRange: '₹28 - 50 LPA',
    experienceRequired: '4-8 years',
    applyUrl: 'https://www.samsung.com/in/aboutsamsung/careers/careers-center/',
    naukriUrl: 'https://www.naukri.com/samsung-semiconductor-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Samsung+Semiconductor+RTL+Bengaluru',
    requiredSkills: ['SystemVerilog', 'RTL Design', 'Exynos Processor Architecture', 'CDC', 'Linting', 'Synthesis'],
    preferredSkills: ['UVM', 'STA', 'Low Power (UPF)'],
    description: 'Design key execution units and cache coherency subsystems for flagship Exynos mobile application processors and neural network accelerators.',
    postedAt: '4 days ago',
    category: 'RTL Design Engineer'
  },

  // FPGA Design Engineering
  {
    id: 'job_fpga_01',
    jobTitle: 'FPGA Design & Acceleration Engineer',
    company: 'AMD (Xilinx Technology Group)',
    location: 'Hyderabad',
    state: 'Telangana',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹20 - 36 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://careers.amd.com/careers-home/jobs?keywords=FPGA%20Hyderabad',
    naukriUrl: 'https://www.naukri.com/fpga-jobs-in-hyderabad',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=AMD+FPGA+Hyderabad',
    requiredSkills: ['VHDL', 'Verilog', 'Vivado', 'FPGA Architecture', 'High-Speed Interfaces', 'Timing Closure'],
    preferredSkills: ['PCIe', 'AXI', 'ModelSim', 'HLS (High Level Synthesis)', 'C/C++'],
    description: 'Design, implement, and benchmark hardware acceleration kernels on AMD Versal and UltraScale+ adaptive SoCs for cloud data centers and high-frequency trading applications.',
    postedAt: '2 days ago',
    category: 'FPGA Design Engineer'
  },
  {
    id: 'job_fpga_02',
    jobTitle: 'Senior FPGA Hardware Engineer',
    company: 'Collins Aerospace',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'On-site',
    salaryRange: '₹16 - 28 LPA',
    experienceRequired: '3-6 years',
    applyUrl: 'https://careers.rtx.com/global/en/search-results?keywords=FPGA%20Bengaluru',
    naukriUrl: 'https://www.naukri.com/fpga-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Collins+Aerospace+FPGA+Bengaluru',
    requiredSkills: ['VHDL', 'FPGA', 'DO-254 Compliance', 'Vivado', 'Microsemi Libero', 'DSP Blocks'],
    preferredSkills: ['Ethernet MAC', 'MIL-STD-1553', 'ARINC 429', 'ModelSim'],
    description: 'Architect mission-critical avionics FPGA controllers conforming to rigorous safety standards. Perform static timing analysis and board-level hardware bringup.',
    postedAt: '3 days ago',
    category: 'FPGA Design Engineer'
  },
  {
    id: 'job_fpga_03',
    jobTitle: 'FPGA Emulation & Prototyping Specialist',
    company: 'Synopsys India',
    location: 'Pune',
    state: 'Maharashtra',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹19 - 34 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://synopsys.wd1.myworkdayjobs.com/Synopsys_Careers?q=FPGA+Pune',
    naukriUrl: 'https://www.naukri.com/fpga-jobs-in-pune',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Synopsys+FPGA+Pune',
    requiredSkills: ['Verilog', 'SystemVerilog', 'HAPS FPGA Prototyping', 'Vivado', 'Partitioning', 'Synthesis'],
    preferredSkills: ['Python', 'Tcl Scripting', 'C++', 'ZeBu Emulation'],
    description: 'Work on cutting-edge FPGA prototyping systems (HAPS) enabling multi-million gate ASIC design mapping, speedup partitioning, and pre-silicon software validation.',
    postedAt: '1 day ago',
    category: 'FPGA Design Engineer'
  },

  // VLSI / Physical Design
  {
    id: 'job_vlsi_01',
    jobTitle: 'Physical Design & Timing Closure Engineer',
    company: 'Apple India',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'On-site',
    salaryRange: '₹30 - 55 LPA',
    experienceRequired: '3-7 years',
    applyUrl: 'https://jobs.apple.com/en-in/search?search=Physical%20Design%20Bengaluru',
    naukriUrl: 'https://www.naukri.com/physical-design-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Apple+Physical+Design+Bengaluru',
    requiredSkills: ['Physical Design', 'Floorplanning', 'CTS (Clock Tree Synthesis)', 'Place and Route', 'STA', 'Primetime'],
    preferredSkills: ['Synopsys ICC2', 'Cadence Innovus', 'FinFET 3nm / 4nm', 'Tcl / Python'],
    description: 'Deliver the next revolution of Apple Silicon. Own floorplanning, placement, clock tree synthesis, routing, and sign-off timing closure on industry-leading nanometer nodes.',
    postedAt: 'Just now',
    category: 'Physical Design Engineer'
  },
  {
    id: 'job_vlsi_02',
    jobTitle: 'ASIC Physical Design Engineer',
    company: 'MediaTek India',
    location: 'Noida',
    state: 'Delhi-NCR',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹18 - 30 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://careers.mediatek.com/',
    naukriUrl: 'https://www.naukri.com/physical-design-jobs-in-noida',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=MediaTek+Physical+Design+Noida',
    requiredSkills: ['Physical Design', 'Innovus / ICC2', 'DRC / LVS', 'Calibre', 'Static Timing Analysis (STA)', 'Tcl'],
    preferredSkills: ['IR Drop Analysis', 'RedHawk', 'Power Optimization'],
    description: 'Drive full-chip and hierarchical block-level physical design for Dimensity 5G smartphone platforms.',
    postedAt: '4 days ago',
    category: 'Physical Design Engineer'
  },
  {
    id: 'job_vlsi_03',
    jobTitle: 'VLSI ASIC Verification Engineer',
    company: 'Arm Embedded Technologies',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹22 - 38 LPA',
    experienceRequired: '2-6 years',
    applyUrl: 'https://careers.arm.com/search-jobs/Bengaluru',
    naukriUrl: 'https://www.naukri.com/arm-vlsi-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Arm+VLSI+Verification+Bengaluru',
    requiredSkills: ['SystemVerilog', 'UVM', 'Functional Coverage', 'Constrained Random Verification', 'AMBA AXI/CHI Protocols'],
    preferredSkills: ['Python', 'Formal Verification', 'ARM Cortex Architecture'],
    description: 'Verify world-standard Arm Cortex-A and Cortex-M processor cores using advanced UVM environments and coverage-driven sign-off metrics.',
    postedAt: '3 days ago',
    category: 'VLSI Engineer'
  },

  // Embedded Systems Engineering
  {
    id: 'job_emb_01',
    jobTitle: 'Embedded Firmware & RTOS Engineer',
    company: 'Robert Bosch Engineering',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹14 - 25 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://careers.bosch.com/en/search/?q=Embedded+Bengaluru',
    naukriUrl: 'https://www.naukri.com/bosch-embedded-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Bosch+Embedded+Systems+Bengaluru',
    requiredSkills: ['Embedded C', 'RTOS (FreeRTOS / Zephyr)', 'ARM Cortex-M', 'Microcontrollers', 'CAN Protocol', 'SPI / I2C / UART'],
    preferredSkills: ['AUTOSAR', 'MISRA C', 'Git', 'Oscilloscopes / Logic Analyzers'],
    description: 'Design and validate real-time safety firmware for automotive electronic control units (ECUs) and autonomous driving sensory modules.',
    postedAt: '1 day ago',
    category: 'Embedded Systems Engineer'
  },
  {
    id: 'job_emb_02',
    jobTitle: 'Senior Embedded Linux & BSP Engineer',
    company: 'Tata Elxsi',
    location: 'Pune',
    state: 'Maharashtra',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹15 - 26 LPA',
    experienceRequired: '3-6 years',
    applyUrl: 'https://www.tataelxsi.com/careers',
    naukriUrl: 'https://www.naukri.com/embedded-jobs-in-pune',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Tata+Elxsi+Embedded+Linux+Pune',
    requiredSkills: ['Embedded Linux', 'Yocto Project', 'Kernel Device Drivers', 'C/C++', 'U-Boot', 'Hardware Bringup'],
    preferredSkills: ['GStreamer', 'V4L2', 'Python', 'Wi-Fi / BLE Drivers'],
    description: 'Develop Board Support Packages (BSP), device drivers, and Linux kernel customizations for next-generation connected smart displays and medical imaging systems.',
    postedAt: '2 days ago',
    category: 'Embedded Systems Engineer'
  },
  {
    id: 'job_emb_03',
    jobTitle: 'IoT Firmware Developer',
    company: 'Mercedes-Benz Research and Development India (MBRDI)',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹18 - 30 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://mbrdi.mercedes-benz.com/careers/',
    naukriUrl: 'https://www.naukri.com/mbrdi-embedded-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Mercedes-Benz+Embedded+Bengaluru',
    requiredSkills: ['Embedded C', 'C++', 'BLE / Wi-Fi Protocols', 'MQTT', 'STM32 / ESP32', 'FreeRTOS'],
    preferredSkills: ['Cybersecurity in Embedded Devices', 'OTA Updates', 'Python'],
    description: 'Build connected vehicle telematics firmware, over-the-air (OTA) bootloaders, and ultra-low-power edge computing nodes for luxury passenger cars.',
    postedAt: 'Just now',
    category: 'Embedded Systems Engineer'
  },
  {
    id: 'job_emb_04',
    jobTitle: 'Embedded Software Engineer (Remote)',
    company: 'Siemens Healthineers',
    location: 'Remote',
    state: 'Pan-India',
    employmentType: 'Full-time',
    workMode: 'Remote',
    salaryRange: '₹16 - 28 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://www.siemens-healthineers.com/careers',
    naukriUrl: 'https://www.naukri.com/remote-embedded-engineer-jobs',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Remote+Embedded+Engineer+Siemens+India',
    requiredSkills: ['Embedded C', 'C++', 'Microcontrollers', 'RTOS', 'Unit Testing', 'Serial Protocols'],
    preferredSkills: ['Medical Device Standards (IEC 62304)', 'Python', 'Git'],
    description: 'Join a 100% remote engineering squad building real-time embedded software for diagnostic point-of-care medical instrumentation.',
    postedAt: '3 days ago',
    category: 'Embedded Systems Engineer'
  },

  // Software & Full-Stack Engineering
  {
    id: 'job_se_01',
    jobTitle: 'Full-Stack Software Engineer',
    company: 'Microsoft India',
    location: 'Hyderabad',
    state: 'Telangana',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹24 - 42 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://careers.microsoft.com/us/en/search-results?keywords=Software%20Hyderabad',
    naukriUrl: 'https://www.naukri.com/microsoft-software-engineer-jobs-in-hyderabad',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Microsoft+Software+Engineer+Hyderabad',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Azure / Cloud Services', 'REST APIs', 'SQL / NoSQL'],
    preferredSkills: ['Docker', 'Kubernetes', 'GraphQL', 'Microservices'],
    description: 'Architect scalable web applications and enterprise collaboration microservices running across multi-region Azure cloud deployments.',
    postedAt: '1 day ago',
    category: 'Software Engineer'
  },
  {
    id: 'job_se_02',
    jobTitle: 'Backend Distributed Systems Engineer',
    company: 'Google',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹32 - 60 LPA',
    experienceRequired: '3-6 years',
    applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/?location=Bengaluru',
    naukriUrl: 'https://www.naukri.com/google-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Google+Software+Engineer+Bengaluru',
    requiredSkills: ['Data Structures', 'Algorithms', 'Go / Java / C++', 'Distributed Systems', 'System Design', 'Concurrency'],
    preferredSkills: ['gRPC', 'Protobuf', 'Kafka', 'GCP'],
    description: 'Work on core infrastructure components serving billions of queries per second with sub-millisecond latencies and five-nines reliability.',
    postedAt: '2 days ago',
    category: 'Software Engineer'
  },
  {
    id: 'job_se_03',
    jobTitle: 'Senior Full-Stack Engineer (Remote)',
    company: 'Atlassian India',
    location: 'Remote',
    state: 'Pan-India',
    employmentType: 'Full-time',
    workMode: 'Remote',
    salaryRange: '₹26 - 48 LPA',
    experienceRequired: '3-7 years',
    applyUrl: 'https://www.atlassian.com/company/careers',
    naukriUrl: 'https://www.naukri.com/remote-software-engineer-jobs',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Atlassian+Remote+India',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
    preferredSkills: ['Redis', 'Micro-frontends', 'CI/CD Pipelines'],
    description: 'Enjoy Atlassian Team Anywhere work policy. Build collaborative tooling, real-time sync canvas components, and resilient cloud services.',
    postedAt: 'Just now',
    category: 'Software Engineer'
  },
  {
    id: 'job_se_04',
    jobTitle: 'Frontend React & Mobile Engineer',
    company: 'Swiggy',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹18 - 32 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://careers.swiggy.com/',
    naukriUrl: 'https://www.naukri.com/swiggy-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Swiggy+Frontend+Bengaluru',
    requiredSkills: ['React', 'React Native', 'JavaScript', 'TypeScript', 'Redux', 'Performance Optimization', 'CSS / Styling'],
    preferredSkills: ['Webpack', 'Jest', 'GraphQL'],
    description: 'Craft high-performance consumer-facing mobile and web applications handling millions of concurrent orders and live geolocation tracking.',
    postedAt: '3 days ago',
    category: 'Software Engineer'
  },

  // Data & AI Engineering
  {
    id: 'job_ai_01',
    jobTitle: 'AI & Generative LLM Solutions Engineer',
    company: 'NVIDIA AI Tech Center',
    location: 'Pune',
    state: 'Maharashtra',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹25 - 46 LPA',
    experienceRequired: '2-6 years',
    applyUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=AI+Pune',
    naukriUrl: 'https://www.naukri.com/ai-engineer-jobs-in-pune',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=NVIDIA+AI+Engineer+Pune',
    requiredSkills: ['Python', 'PyTorch', 'Large Language Models (LLMs)', 'Transformer Architectures', 'CUDA', 'Vector Databases'],
    preferredSkills: ['TensorRT-LLM', 'LangChain', 'Docker', 'Triton Inference Server'],
    description: 'Deploy accelerated generative AI models, fine-tune open-weight foundations (Llama, Mistral, Nemotron), and optimize inference pipelines using TensorRT-LLM.',
    postedAt: '1 day ago',
    category: 'Data/AI Engineer'
  },
  {
    id: 'job_ai_02',
    jobTitle: 'Machine Learning & MLOps Engineer',
    company: 'Adobe Systems India',
    location: 'Noida',
    state: 'Delhi-NCR',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹22 - 40 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://careers.adobe.com/us/en/search-results?keywords=Machine%20Learning%20Noida',
    naukriUrl: 'https://www.naukri.com/adobe-machine-learning-jobs-in-noida',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Adobe+Machine+Learning+Noida',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow / PyTorch', 'MLOps', 'Docker', 'Kubernetes', 'AWS / Azure'],
    preferredSkills: ['Computer Vision', 'Data Pipelines', 'FastAPI'],
    description: 'Scale neural generation and creative intelligence pipelines power-driving Adobe Sensei and Firefly creative cloud tooling.',
    postedAt: '2 days ago',
    category: 'Data/AI Engineer'
  },
  {
    id: 'job_ai_03',
    jobTitle: 'Data & Applied AI Engineer',
    company: 'PhonePe',
    location: 'Bengaluru',
    state: 'Karnataka',
    employmentType: 'Full-time',
    workMode: 'On-site',
    salaryRange: '₹20 - 38 LPA',
    experienceRequired: '2-5 years',
    applyUrl: 'https://www.phonepe.com/careers/',
    naukriUrl: 'https://www.naukri.com/phonepe-data-engineer-jobs-in-bengaluru',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=PhonePe+Data+Engineer+Bengaluru',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'Machine Learning', 'Feature Engineering'],
    preferredSkills: ['Fraud Detection Systems', 'Airflow', 'Snowflake'],
    description: 'Construct real-time transaction feature streaming pipelines and fraud detection models processing over 100 million UPI payments every day.',
    postedAt: '4 days ago',
    category: 'Data/AI Engineer'
  },

  // Chennai & Mumbai Openings
  {
    id: 'job_chennai_01',
    jobTitle: 'Hardware Architecture & Verification Engineer',
    company: 'Zoho Corporation',
    location: 'Chennai',
    state: 'Tamil Nadu',
    employmentType: 'Full-time',
    workMode: 'On-site',
    salaryRange: '₹14 - 24 LPA',
    experienceRequired: '1-4 years',
    applyUrl: 'https://www.zoho.com/careers/',
    naukriUrl: 'https://www.naukri.com/zoho-jobs-in-chennai',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=Zoho+Hardware+Chennai',
    requiredSkills: ['Verilog', 'SystemVerilog', 'Digital Design', 'FPGA Prototyping', 'C/C++'],
    preferredSkills: ['Linux', 'Hardware Benchmarking', 'Network Protocols'],
    description: 'Work with Zoho proprietary cloud server and custom edge appliance engineering teams developing custom accelerator boards.',
    postedAt: '2 days ago',
    category: 'RTL Design Engineer'
  },
  {
    id: 'job_mumbai_01',
    jobTitle: 'Senior Software Engineer (FinTech Platform)',
    company: 'JPMorgan Chase & Co.',
    location: 'Mumbai',
    state: 'Maharashtra',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    salaryRange: '₹22 - 38 LPA',
    experienceRequired: '3-6 years',
    applyUrl: 'https://careers.jpmorgan.com/global/en/home',
    naukriUrl: 'https://www.naukri.com/jpmorgan-jobs-in-mumbai',
    linkedInUrl: 'https://www.linkedin.com/jobs/search/?keywords=JPMorgan+Software+Engineer+Mumbai',
    requiredSkills: ['Java', 'Spring Boot', 'React', 'Microservices', 'SQL', 'System Design', 'Kafka'],
    preferredSkills: ['Cloud (AWS)', 'Kubernetes', 'Docker'],
    description: 'Build enterprise-grade, high-throughput financial clearance and market risk calculation engines with multi-asset capabilities.',
    postedAt: '1 day ago',
    category: 'Software Engineer'
  }
];

/**
 * Calculates deterministic ATS Match Score between candidate resume and a job vacancy
 */
export const calculateAtsMatch = (job, resume, userRole = '') => {
  const resumeSkills = (resume?.extractedData?.skills || []).map((s) => s.toLowerCase().trim());
  const rawText = (resume?.rawText || '').toLowerCase();
  const required = job.requiredSkills || [];
  const preferred = job.preferredSkills || [];
  const allJobSkills = [...required, ...preferred];

  const matchedSkills = [];
  const missingSkills = [];

  // Skill comparison with fuzzy & synonym matching
  allJobSkills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    // Check direct equality, inclusion, or synonym variations
    const isDirectMatch = resumeSkills.some(
      (rs) => rs === sLower || rs.includes(sLower) || sLower.includes(rs)
    );
    const isTextMatch = rawText.includes(sLower);

    // Common synonyms/equivalences
    let isSynonymMatch = false;
    if (sLower.includes('systemverilog') && (rawText.includes('system verilog') || rawText.includes('sv'))) isSynonymMatch = true;
    if (sLower.includes('rtos') && (rawText.includes('freertos') || rawText.includes('real-time operating'))) isSynonymMatch = true;
    if (sLower.includes('c/c++') && (rawText.includes(' c ') || rawText.includes('c++') || resumeSkills.includes('c') || resumeSkills.includes('c++'))) isSynonymMatch = true;
    if (sLower.includes('sta') && rawText.includes('static timing analysis')) isSynonymMatch = true;
    if (sLower.includes('cdc') && rawText.includes('clock domain crossing')) isSynonymMatch = true;
    if (sLower.includes('rest api') && (rawText.includes('restful') || rawText.includes('api'))) isSynonymMatch = true;
    if (sLower.includes('react') && rawText.includes('react native')) isSynonymMatch = true;

    if (isDirectMatch || isTextMatch || isSynonymMatch) {
      if (!matchedSkills.includes(skill)) {
        matchedSkills.push(skill);
      }
    } else {
      if (!missingSkills.includes(skill)) {
        missingSkills.push(skill);
      }
    }
  });

  // Score computation
  const totalRequired = Math.max(required.length, 1);
  const requiredMatches = required.filter((req) => matchedSkills.includes(req)).length;
  const reqMatchRatio = requiredMatches / totalRequired;

  const totalPreferred = Math.max(preferred.length, 1);
  const prefMatches = preferred.filter((pref) => matchedSkills.includes(pref)).length;
  // Preferred skills provide bonus scaling; if no preferred skills listed or partial, don't heavily penalize
  const prefMatchRatio = preferred.length > 0 ? (prefMatches / totalPreferred) : 0.6;

  // Role relevance score
  const candidateRole = (resume?.targetRole || userRole || '').toLowerCase();
  const jobRole = (job.category || job.jobTitle || '').toLowerCase();
  const cleanCandidateRole = candidateRole.replace('engineer', '').trim();
  const roleScore = (candidateRole && jobRole.includes(cleanCandidateRole)) ? 1.0 : 0.75;

  // Experience & projects boost from resume
  const experienceCount = resume?.extractedData?.experience?.length || 0;
  const projectsCount = resume?.extractedData?.projects?.length || 0;
  const profileCompleteness = Math.min(1.0, (experienceCount * 0.2) + (projectsCount * 0.2) + 0.6);

  let rawScore = Math.round(
    (reqMatchRatio * 65) +
    (prefMatchRatio * 10) +
    (roleScore * 15) +
    (profileCompleteness * 10)
  );

  // If candidate hasn't uploaded a resume yet, provide realistic preview score
  if (!resume || (!resumeSkills.length && !rawText)) {
    rawScore = 72; // Neutral baseline indicating action needed
  }

  const atsMatchScore = Math.max(35, Math.min(98, rawScore));

  return {
    atsMatchScore,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 6)
  };
};

/**
 * Normalizes query string for location comparison
 */
const matchLocation = (jobLocation, filterLocation) => {
  if (!filterLocation || filterLocation.trim().toLowerCase() === 'all' || filterLocation.trim() === '') {
    return true;
  }
  const f = filterLocation.toLowerCase().trim();
  const loc = (jobLocation || '').toLowerCase();

  if (f === 'remote') return loc.includes('remote') || loc.includes('pan-india');
  if (f === 'bengaluru' || f === 'bangalore') return loc.includes('bengaluru') || loc.includes('bangalore');
  if (f === 'hyderabad') return loc.includes('hyderabad');
  if (f === 'pune') return loc.includes('pune');
  if (f === 'chennai') return loc.includes('chennai');
  if (f === 'delhi-ncr' || f === 'delhi' || f === 'noida' || f === 'gurugram') {
    return loc.includes('delhi') || loc.includes('noida') || loc.includes('gurugram') || loc.includes('ncr');
  }
  if (f === 'mumbai') return loc.includes('mumbai');

  return loc.includes(f);
};

/**
 * Normalizes query string for role comparison
 */
const matchRole = (job, filterRole) => {
  if (!filterRole || filterRole.trim().toLowerCase() === 'all' || filterRole.trim() === '') {
    return true;
  }
  const f = filterRole.toLowerCase().trim();
  const title = (job.jobTitle || '').toLowerCase();
  const cat = (job.category || '').toLowerCase();

  // Role track mappings
  if (f.includes('rtl')) return title.includes('rtl') || cat.includes('rtl');
  if (f.includes('fpga')) return title.includes('fpga') || cat.includes('fpga');
  if (f.includes('vlsi') || f.includes('asic')) return title.includes('vlsi') || title.includes('asic') || cat.includes('vlsi');
  if (f.includes('physical design')) return title.includes('physical design') || cat.includes('physical design');
  if (f.includes('embedded')) return title.includes('embedded') || title.includes('firmware') || cat.includes('embedded');
  if (f.includes('software')) return title.includes('software') || title.includes('full-stack') || title.includes('backend') || title.includes('frontend') || cat.includes('software');
  if (f.includes('ai') || f.includes('data') || f.includes('machine learning')) return title.includes('ai') || title.includes('data') || title.includes('machine learning') || cat.includes('ai');

  return title.includes(f) || cat.includes(f);
};

/**
 * Fetches and scores recommended jobs based on filters and resume
 */
export const getRecommendedJobs = async ({
  location = '',
  role = '',
  workMode = '',
  search = '',
  user = null,
  resume = null
}) => {
  let jobsList = [...INDIAN_TECH_HUB_JOBS];

  // If RapidAPI / JSearch is configured, we can attempt live ingestion
  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;
  if (rapidApiKey) {
    try {
      const queryParam = `${role || user?.targetRole || 'Software Engineer'} in ${location || 'India'}`;
      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(queryParam)}&num_pages=1`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          },
          signal: AbortSignal.timeout(4000)
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const liveJobs = data.data.map((item, idx) => ({
            id: `rapid_${item.job_id || idx}`,
            jobTitle: item.job_title || 'Engineering Specialist',
            company: item.employer_name || 'Tech Innovators',
            location: item.job_city || location || 'Bengaluru',
            state: item.job_state || 'India',
            employmentType: item.job_employment_type || 'Full-time',
            workMode: item.job_is_remote ? 'Remote' : 'Hybrid',
            salaryRange: item.job_min_salary ? `₹${Math.round(item.job_min_salary / 100000)} - ${Math.round(item.job_max_salary / 100000)} LPA` : 'Competitive',
            applyUrl: item.job_apply_link || `https://www.naukri.com/jobs-in-india`,
            naukriUrl: `https://www.naukri.com/jobs-in-india`,
            linkedInUrl: item.job_google_link || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(item.job_title || '')}`,
            requiredSkills: item.job_required_skills || ['Engineering Fundamentals', 'Problem Solving', 'Git'],
            preferredSkills: item.job_highlights?.Qualifications?.slice(0, 3) || ['System Design', 'Communication'],
            description: item.job_description ? item.job_description.slice(0, 300) + '...' : 'Exciting career opportunity in tech.',
            postedAt: 'Recently',
            category: role || 'Engineering'
          }));
          jobsList = [...liveJobs, ...jobsList];
        }
      }
    } catch (e) {
      console.log('[JobSearchService] JSearch API skipped/fallback used:', e.message);
    }
  }

  // Filter by location
  if (location && location.trim().toLowerCase() !== 'all') {
    jobsList = jobsList.filter((j) => matchLocation(j.location, location));
  }

  // Filter by role
  if (role && role.trim().toLowerCase() !== 'all') {
    jobsList = jobsList.filter((j) => matchRole(j, role));
  }

  // Filter by workMode
  if (workMode && workMode.trim().toLowerCase() !== 'all') {
    jobsList = jobsList.filter((j) => (j.workMode || '').toLowerCase() === workMode.toLowerCase().trim());
  }

  // Filter by freeform search keyword
  if (search && search.trim() !== '') {
    const s = search.toLowerCase().trim();
    jobsList = jobsList.filter((j) =>
      j.jobTitle.toLowerCase().includes(s) ||
      j.company.toLowerCase().includes(s) ||
      (j.requiredSkills || []).some((sk) => sk.toLowerCase().includes(s))
    );
  }

  // Calculate ATS match score against resume for each job
  const enrichedJobs = jobsList.map((job) => {
    const atsResult = calculateAtsMatch(job, resume, user?.targetRole || role);
    return {
      ...job,
      atsMatchScore: atsResult.atsMatchScore,
      matchedSkills: atsResult.matchedSkills,
      missingSkills: atsResult.missingSkills
    };
  });

  // Sort by ATS Match Score descending (highest match fit first)
  enrichedJobs.sort((a, b) => b.atsMatchScore - a.atsMatchScore);

  return {
    total: enrichedJobs.length,
    resumeFound: !!resume,
    resumeFileName: resume?.originalFileName || null,
    candidateSkillsCount: resume?.extractedData?.skills?.length || 0,
    jobs: enrichedJobs
  };
};
