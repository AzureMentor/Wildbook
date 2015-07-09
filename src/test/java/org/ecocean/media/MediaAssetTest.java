/*
 * This file is a part of Wildbook.
 * Copyright (C) 2015 WildMe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Foobar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wildbook.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.ecocean.media;

import java.util.*;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.*;

import static org.junit.Assert.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.samsix.database.*;

import org.ecocean.*;

/**
 * Test MediaAsset routines.
 */
public class MediaAssetTest extends DBTestBase {
    private static Logger log = LoggerFactory.getLogger(MediaAssetTest.class);

    @Test
    public void testSaveLoadDelete() {
        if (ci == null) {
            log.info("No test db - skipping tests");
            return;
        }

        try (Database db = new Database(ci)) {
            AssetStore las = new LocalAssetStore("test", Paths.get("/etc"), null, true);
            las.save(db);

            MediaAsset ma = las.create(Paths.get("/etc/hosts"), AssetType.ORIGINAL);
            assertNotNull("Null MediaAsset", ma);

            ma.save(db);

            long id = ma.id;
            assertTrue("No id", id != MediaAsset.NOT_SAVED);

            // load by id
            ma = MediaAsset.load(db, id);
            assertNotNull("MediaAsset not loaded by id", ma);

            // delete
            ma.delete(db);

            ma = MediaAsset.load(db, id);
            assertNull("New MediaAsset not deleted", ma);

            las.delete(db); // clean up

        } catch (DatabaseException ex) {
            fail(ex.getMessage());
        }
    }

    @Test
    public void testFindOrCreate() {
        if (ci == null) {
            log.info("No test db - skipping tests");
            return;
        }

        try (Database db = new Database(ci)) {
            AssetStore las = new LocalAssetStore("test", Paths.get("/etc"), null, true);
            las.save(db);

            Path path = Paths.get("/etc/hosts");

            // make sure doesn't exist first
            MediaAsset ma = MediaAsset.load(db, las, path);
            assertNull("Asset already exists", ma);

            // call once to create then once to load
            ma = MediaAsset.findOrCreate(db, las, path, AssetType.ORIGINAL);
            assertNotNull("Null MediaAsset after first call", ma);

            MediaAsset ma2 = MediaAsset.findOrCreate(db, las, path, AssetType.ORIGINAL);
            assertNotNull("Null MediaAsset after second call", ma2);

            assertEquals("Assets not the same", ma.id, ma2.id);

            // delete
            ma.delete(db);

            ma = MediaAsset.load(db, ma.id);
            assertNull("New MediaAsset not deleted", ma);

            las.delete(db); // clean up

        } catch (DatabaseException ex) {
            fail(ex.getMessage());
        }
    }
}
