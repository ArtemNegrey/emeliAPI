import {expect, test} from "@playwright/test";

interface WordPressPost {

    id: number;
    date: string;
    date_gtm: string;

    guid:{
        rendered: string
    }

    modified: string;
    modified_gtm: string;

    title:{
        rendered: string
    }

    content: {
        rendered: string,
        protected: boolean,
        block_version: number;
    }}

    let createdPostIds: number [] = [];

    test.describe('check autorization', async () =>{

    const baseUrl = 'https://dev.emeli.in.ua/wp-json/wp/v2';
    const credentials = Buffer.from('admin:Engineer_123').toString('base64');
    const performanceTimeOut = 3000;

    test.beforeAll (async({request})=>{

        try {
            const healthCheck = await request.get(`${baseUrl}/posts`, {

                headers:{
                   'Authorization': `Basic ${credentials}` 
                }
            });

            expect(healthCheck.status()).toBe(200);
            console.log('Initialization is successful');

        } catch (error) {

            console.error('Initialization is failed', error);
            throw error;
        }

    })
    test("create new post", async ({ request }) => {
        const postData = {
          title: "title test Post",
          content: "content test Post",
          status: "publish",
        };
    
        const startTime = Date.now();
        const response = await request.post(`${baseUrl}/posts`, {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          data: postData,
        });
    
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(performanceTimeOut);
        expect(response.status()).toBe(201);
    
        const responseData = await response.json();
        expect(responseData).toMatchObject({
          id: expect.any(Number),
          date: expect.any(String),
          title: {
            rendered: postData.title,
          },
          content: {
            rendered: expect.stringContaining(postData.content),
          },
          status: "publish",
        });
    
        expect(responseData.title.rendered).toBe(postData.title);
        expect(responseData.content.rendered).toContain(postData.content);
    
        createdPostIds.push(responseData.id);
        console.log("Post created with ID:", responseData.id);
      });

      test("get posts list", async ({ request }) => {
        const response = await request.get(`${baseUrl}/posts`, {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });
    
        expect(response.status()).toBe(200);
        const posts: WordPressPost[] = await response.json();
        expect(posts.length).toBeGreaterThan(0);
    
        for (const post of posts) {
          expect(post).toMatchObject({
            id: expect.any(Number),
            date: expect.any(String),
            title: {
              rendered: expect.any(String),
            },
            content: {
              rendered: expect.any(String),
              protected: expect.any(Boolean),
            },
          });
        }
    
        console.log("Number of posts:", posts.length);
      });

      test("remove post from list", async ({ request }) => {
        const response = await request.delete(`${baseUrl}/posts/14814`, {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });
    
        expect(response.status()).toBe(200);
      });

      test("check deleted post from list", async ({ request }) => {
        const response = await request.get(`${baseUrl}/posts/14814`, {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });
    
        expect(response.status()).toBe(200);
      });

    
})