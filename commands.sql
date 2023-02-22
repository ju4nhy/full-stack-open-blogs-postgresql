CREATE TABLE blogs ( 
    id SERIAL PRIMARY KEY, 
    author text, 
    url text NOT NULL, 
    title text NOT NULL, 
    likes integer DEFAULT 0 
);

insert into blogs (author, url, title) values ('juanhy', 'http://localhost:3000/api/blogs/TBA', 'Test Blog');
insert into blogs (url, title) values ('http://comingsoon', 'Default Test Blog');

SELECT * FROM blogs;