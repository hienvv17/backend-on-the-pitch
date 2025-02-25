// import { Test, TestingModule } from '@nestjs/testing';
// import { JwtService } from '@nestjs/jwt';
// import { Repository } from 'typeorm';
// import { AuthService } from './auth.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { UnauthorizedException } from '@nestjs/common';
// import { User } from '../user/entities/user.entity';
// import { config as envConfig } from 'dotenv';
// import { ErrorMessage, SuccessMessage } from '../common/utils/message-const';
// import { BaseResponse } from '../common/base-response/base-response.dto';

// envConfig();
// describe('AuthService', () => {
//   let service: AuthService;
//   let userRepository: Repository<User>;
//   let jwtService: JwtService;

//   const mockUserRepository = () => ({
//     findOne: jest.fn(),
//   });

//   const mockJwtService = {
//     signAsync: jest.fn(),
//   };

//   const user = {
//     id: 1,
//     email: 'tyler@gmail.com',
//     username: 'tyler@gmail.com',
//     password: 'abc123',
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         { provide: getRepositoryToken(User), useValue: mockUserRepository() },
//         { provide: JwtService, useValue: mockJwtService },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     userRepository = module.get<Repository<User>>(getRepositoryToken(User));
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('login', () => {
//     it('should return a JWT token if credentials are valid', async () => {
//       // Mock the userRepository and jwtService as needed
//       jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
//       jest
//         .spyOn(jwtService, 'signAsync')
//         .mockResolvedValue(
//           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0eWxlckBnbWFpbC5jb20iLCJpYXQiOjE3MjM1NDI2NzcsImV4cCI6MTcyMzU0ODY3N30.5QjgKedoYQLvPMuq0L2PLhx2SB1JhCLu3Y74ZIaEWlw',
//         );

//       // Create an instance of BaseResponse with the expected shape
//       const expectedResponse: BaseResponse = {
//         data: {
//           access_token:
//             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0eWxlckBnbWFpbC5jb20iLCJpYXQiOjE3MjM1NDI2NzcsImV4cCI6MTcyMzU0ODY3N30.5QjgKedoYQLvPMuq0L2PLhx2SB1JhCLu3Y74ZIaEWlw',
//           user: user,
//         },
//         isSuccess: true,
//         message: SuccessMessage.LOGIN_SUCCESS,
//       };

//       // Ensure the login method returns the correct BaseResponse
//       const result = await service.login(user.email, user.password);

//       // Match the result with the expected response
//       expect(result).toEqual(expectedResponse);

//       // Verify the signAsync method was called with the correct arguments
//       expect(jwtService.signAsync).toHaveBeenCalledWith(
//         { id: user.id, email: user.email, username: user.username },
//         { secret: process.env.SECRET_KEY },
//       );
//     });

//     it('should throw UnauthorizedException if password is incorrect', async () => {
//       jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

//       await expect(service.login(user.email, 'wrongpassword')).rejects.toThrow(
//         new UnauthorizedException(ErrorMessage.USERNAME_PASSWORD_INCORRECT),
//       );
//     });
//   });
// });
