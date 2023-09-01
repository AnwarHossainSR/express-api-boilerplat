import validationMiddleware from '@/middleware/validation.middleware';
import PostService from '@/resources/post/post.service';
import validate from '@/resources/post/post.validation';
import HttpException from '@/utils/exceptions/http.exception';
import Controller from '@/utils/interfaces/controller.interface';
import { CustomRequest, upload } from '@/utils/multerHelper';
import { NextFunction, Request, Response, Router } from 'express';

class PostController implements Controller {
    public path = '/posts';
    public router = Router();
    private PostService = new PostService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}`,
            upload.single('file'), // 'file' should match the name attribute of your file input in the HTML form
            validationMiddleware(validate.create),
            this.create
        );
    }

    private create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { title, body } = req.body;

            const file = (req as CustomRequest).file;

            // Check if a file was uploaded
            if (!file) {
                return next(new HttpException(400, 'File not provided'));
            }

            const post = await this.PostService.create(title, body, file.path);

            res.status(201).json({ post });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };
}

export default PostController;

//Create post
/**
 * @swagger
 * /api/Posts:
 *   post:
 *     tags: [Posts]
 *     description: "Create a new post"
 *     operationId: "createPost"
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *                title:
 *                 type: string
 *                 format: string
 *                 required: true
 *                 example: "test post"
 *                body:
 *                 type: string
 *                 format: string
 *                 required: true
 *                 example: "test post body"
 *                file:
 *                 type: file
 *                 format: file
 *     responses:
 *       '200':
 *         description: Add Value Response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message = Invalid request
 *                 status:
 *                   type: string
 *                   description: Status = failure
 */
