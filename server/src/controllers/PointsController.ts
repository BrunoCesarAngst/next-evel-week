import { Request, Response } from 'express'
import knex from '../database/connection';

class PointsController {

  // filter city, uf, items (query params)
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    console.log(city, uf, items);

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

      const points = await knex('points')
        .join('points_items', 'points.id', '=', 'points_items.point_id')
        .whereIn('points_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');

      const serializedPoints = points.map(point=> {
        return {
          ...point,
          // image_url: `http://localhost:3333/uploads/${item.image}`,
          image_url: `http://192.168.0.104:3333/uploads/${point.image}`,
        };
      });

      return response.json(serializedPoints);

    return response.json(points);
  }

  async show(request: Request, response: Response) {
    // const id = request.params.id;
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return response.status(400).json({ massage: 'Point not found!' });
    }

    const serializedPoints = {
      ...point,
      // image_url: `http://localhost:3333/uploads/${item.image}`,
      image_url: `http://192.168.0.104:3333/uploads/${point.image}`,
    };

    return response.json(serializedPoints);

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id)
      .select('items.title');

    return response.json({ point: serializedPoints, items });
  }

  async create(request: Request, response: Response) {

    const {
      // data
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;

    const trx = await knex.transaction();

    const point = {
      name,
      image: request.file.filename,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    const insertedIds = await trx('points').insert(point);

    const point_id = insertedIds[0];

    const pointsItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        }
      })

    await trx('points_items').insert(pointsItems);

    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointsController;

// sql migrations seeds transactions TS
