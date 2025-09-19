const roles = {
    PRESIDENT: 'president',
    VICE_PRESIDENT: 'vice-president',
    DIRECTOR: 'director',
    OFFICE_HEAD: 'office-head',
    // Add other roles as needed
};

const vicePresidents = {
    VICE_PRESIDENT_FOR_ACADEMIC_AFFAIRS: {
        name: 'vice_president_for_academic_affairs',
        subRoles: [
            'Assistant Vice President for Academic Affairs',
            'Dean, College of Arts and Sciences',
            'Dean, College of Business Management and Accountancy',
            'Dean, College of Computer Studies',
            'Dean, College of Criminal Justice',
            'Dean, College of Education',
            'Dean, College of Engineering',
            'Dean, College of Fisheries',
            'Dean, College of Industrial Technology',
            'Director, Advanced Education Program',
            'Director, Curriculum and Instructional Materials Development',
            'Director Admission and Registrarship',
            'Director Guidance Services',
            'Director Library And Information Services',
            'Director National Service Training Program',
            'Director Student Affairs and Services',
            'Director Scholarship',
            'Director Internationalization and External Affairs',
            'Director Alumni Relations',
        ],
    },
    VICE_PRESIDENT_FOR_ADMINISTRATION_AND_FINANCE: {
        name: 'vice_president_for_administration_and_finance',
        subRoles: [
            {
                name: 'Chief Administrative Officer - Administration Division',
                subRoles: [
                    'Human Resource Management Officer',
                    'Procurement Management Officer',
                    'Records Management Officer',
                    'Property and Supply Management Officer',
                    'Security Officer',
                    'General Services Officer',
                ],
            },
            {
                name: 'Chief Administrative Officer - Finance Division',
                subRoles: ['Accountant', 'Budget Officer', 'Cashier'],
            },
            'Executive Director, Allis Campus',
            'Executive Director, Binalbogan Campus',
            'Executive Director, Fortune Towne Campus',
            'Director Business Affairs',
            'Director, Human Resource Development',
            {
                name: 'Director Information and Communication Technology',
                subRoles: ['MIS Officer', 'IT Officer'],
            },
            'Director Physical Plant and Facilities Management',
            'Director for Risk Reduction and Management',
        ],
    },
    VICE_PRESIDENT_FOR_RESEARCH_EXTENSION_AND_INTELLECTUAL_PROPERTY: {
        name: 'vice_president_for_research_extension_and_intellectual_property',
        subRoles: [
            'Director, Extension and Community Services',
            'Director, Intellectual Property Management',
            {
                name: 'Director, Research and Development Services',
                subRoles: [
                    'Deputy Director, Research Ethics Review',
                    'Deputy Director, Scientific Review',
                ],
            },
        ],
    },
};

// Export the roles and vicePresidents if needed
export { roles, vicePresidents };
