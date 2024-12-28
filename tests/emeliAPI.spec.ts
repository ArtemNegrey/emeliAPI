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
    const perfomanceTimeOut = 3000;

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
    test ('create new post', async({request})=>{

        const postData = {

            title: 'title test Post',
            content: 'content test Post',
            status: 'publish'

        }

        const startTime = Date.now();
        const responce = await request.post(`${baseUrl}/posts`, {

            headers:{
                'Authorization': `Basic ${credentials}`,
                'Content-Type': `application/json`
            },

            data: postData

        });

        const responceTime = Date.now() - startTime;
        expect (responceTime).toBeLessThan(perfomanceTimeOut)
        expect (responce.status()).toBe(201)
        
    })

    


})