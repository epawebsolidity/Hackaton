'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Photos', {
      id_fhotos: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // generate UUID otomatis
      },
      id_address: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Addresses', // pastikan tabel Addresses sudah ada
          key: 'id_address',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: false, // simpan path / URL foto
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Photos');
  }
};
