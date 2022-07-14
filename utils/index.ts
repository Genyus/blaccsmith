export const socials = {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com/in',
    twitter: 'https://twitter.com',
};

export const formatSocial = (name: keyof typeof socials, value: string) => {
    // const linkText = name === 'linkedin' ? 'View' : value;
    return [`${socials[name]}/${value}`, `[View](${socials[name]}/${value})`];
};
