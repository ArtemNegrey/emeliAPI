import { test, expect } from '@playwright/test';

interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: object;
}

test.describe('WordPress Post Lifecycle', () => {
  const baseUrl = 'https://dev.emeli.in.ua/wp-json/wp/v2';
  const credentials = Buffer.from('admin:Engineer_123').toString('base64');
  const PERFORMANCE_TIMEOUT = 3000;

  test.beforeAll(async ({ request }) => {
    const healthCheck = await request.get(`${baseUrl}/posts`, {
      headers: {
        'Authorization': Basic ${credentials}
      }
    });
    expect(healthCheck.status()).toBe(200, 'API should be accessible');
  });

  test('should handle full post lifecycle - create, edit, delete', async ({ request }) => {
    // 1. Создание статьи
    const createStartTime = Date.now();
    
    const createData = {
      title: 'Test Lifecycle Post',
      content: 'Initial content for lifecycle testing',
      status: 'publish'
    };

    const createResponse = await request.post(`${baseUrl}/posts`, {
      headers: {
        'Authorization': Basic ${credentials},
        'Content-Type': 'application/json'
      },
      data: createData
    });

    const createTime = Date.now() - createStartTime;
    expect(createTime).toBeLessThan(PERFORMANCE_TIMEOUT, 'Create operation should be fast');
    expect(createResponse.status()).toBe(201, 'Post should be created');

    const createdPost = await createResponse.json() as WordPressPost;
    expect(createdPost.id).toBeTruthy('Created post should have an ID');
    expect(createdPost.title.rendered).toBe(createData.title);
    expect(createdPost.content.rendered).toContain(createData.content);

    // Пауза между операциями
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Редактирование статьи
    const editStartTime = Date.now();
    
    const updateData = {
      title: 'Updated Lifecycle Post',
      content: 'Updated content for lifecycle testing',
    };

    const editResponse = await request.put(`${baseUrl}/posts/${createdPost.id}`, {
      headers: {
        'Authorization': Basic ${credentials},
        'Content-Type': 'application/json'
      },
      data: updateData
    });

    const editTime = Date.now() - editStartTime;
    expect(editTime).toBeLessThan(PERFORMANCE_TIMEOUT, 'Edit operation should be fast');
    expect(editResponse.status()).toBe(200, 'Post should be updated');

    const updatedPost = await editResponse.json() as WordPressPost;
    expect(updatedPost.id).toBe(createdPost.id, 'Post ID should remain the same');
    expect(updatedPost.title.rendered).toBe(updateData.title);
    expect(updatedPost.content.rendered).toContain(updateData.content);
    expect(updatedPost.modified).not.toBe(createdPost.modified, 'Modified date should be updated');

    // Проверка получения обновленной статьи
    const getResponse = await request.get(`${baseUrl}/posts/${createdPost.id}`, {
      headers: {
        'Authorization': Basic ${credentials}
      }
    });
    
    expect(getResponse.status()).toBe(200, 'Should be able to get updated post');
    const retrievedPost = await getResponse.json() as WordPressPost;
    expect(retrievedPost.title.rendered).toBe(updateData.title);
    expect(retrievedPost.content.rendered).toContain(updateData.content);

    // Пауза между операциями
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Удаление статьи
    const deleteStartTime = Date.now();
    
    const deleteResponse = await request.delete(`${baseUrl}/posts/${createdPost.id}`, {
      headers: {
        'Authorization': Basic ${credentials}
      }
    });

    const deleteTime = Date.now() - deleteStartTime;
    expect(deleteTime).toBeLessThan(PERFORMANCE_TIMEOUT, 'Delete operation should