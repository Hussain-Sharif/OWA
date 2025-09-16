export const getGithubRepoInfo = async (userName: string, repoName: string, pat: string) => {
    try {
        const urlPath = `https://api.github.com/repos/${userName}/${repoName}/commits`;
        const response = await fetch(urlPath, {
            headers: {
                "User-Agent": "Hono-App",
                Authorization: `token ${pat}`,
            },
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                message: await response.text(),
            };
        }

        const data = await response.json();
        // console.log(data);
        console.log(response.status);
        return {
            statusCode: response.status,
            message: "All Good We Got Data",
            data: data,
        };
    } catch (error: any) {
        console.error(error);
        return {
            statusCode: 500,
            message: "Internal Server Error",
        };
    }
};
