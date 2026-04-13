import { Test, TestingModule } from '@nestjs/testing';
import { InfoServiceController } from './info-service.controller';
import { InfoServiceService } from './info-service.service';

describe('InfoServiceController', () => {
  let infoServiceController: InfoServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InfoServiceController],
      providers: [InfoServiceService],
    }).compile();

    infoServiceController = app.get<InfoServiceController>(InfoServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(infoServiceController.getHello()).toBe('Hello World!');
    });
  });
});
